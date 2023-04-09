import csv
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import json
from flask import Flask,jsonify,render_template,request
from flask_cors import CORS
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn import manifold
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

df_test = pd.read_csv('static/data/pokemon.csv')
df_test.replace('', np.nan, inplace=True)
df_test.replace('Not Found', np.nan, inplace=True)
df_test.dropna( inplace=True)
df = df_test[['attack','defense','hp','sp_attack','sp_defense','speed','base_total','height_m','weight_kg','capture_rate']]

scalar = StandardScaler()
mixmaxscalar = MinMaxScaler()
columns_ = df.select_dtypes(include=['int64', 'float64']).columns
columns_PC = ["PC1","PC2","PC3","PC4","PC5","PC6","PC7","PC8","PC9"]
df = df[columns_]

scaled_df = scalar.fit_transform(df[columns_])
scaled_df = pd.DataFrame(scaled_df, columns=columns_)
scaled_df = pd.DataFrame(mixmaxscalar.fit_transform(scaled_df), columns=columns_)

pca = PCA(n_components=9)
pca_s = pca.fit_transform(scaled_df)

pca_variance_ratio = pca.explained_variance_ratio_
pca_variance_cumsum = pca_variance_ratio.cumsum()

topComponents = 0
pcp_key = []

@app.route('/')
def index():
    global topComponents
    topComponents = 0
    return render_template('index.html')

@app.route('/screeplot', methods=['GET', 'POST'])
def screeplot():
    global topComponents
    if request.method == 'POST':
        topComponents = request.get_json()
    return jsonify(pca_variance_ratio.tolist(),pca_variance_cumsum.tolist())

eiganvectors = pd.DataFrame(data = pca_s, columns=columns_PC)
loadings = pd.DataFrame(pca.components_.T, columns=columns_PC, index=columns_)

kmeans_res_el = []
for i in range(1, 11):
    kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42)
    kmeans.fit(scaled_df)
    kmeans_res_el.append(kmeans.inertia_)

kmeans = KMeans(n_clusters= 3)
kmeans_res = kmeans.fit_predict(scaled_df)

@app.route('/biplot')
def biplot():
    data = {
        'load': loadings[['PC1','PC2']].to_dict(),
        'eigen': eiganvectors[['PC1','PC2']].to_dict(),
        'kmeans_color': kmeans_res.tolist()
    }
    return jsonify(json.dumps(data))

@app.route('/elbowplot')
def elbowplot():
    return jsonify(kmeans_res_el)

columns_list = columns_.tolist()

@app.route('/scatterplot')
def scatterplot():
    global topComponents
    if topComponents!=0:
        top_value = topComponents['key']
        top_value = int(top_value) + 1
    else:
        top_value = -1
    if top_value>0:
        sum = defaultdict(list)
        for i in range(0,top_value):
            if i==0:
                for j in range(0,9):
                    sum[columns_list[j]].append(loadings[columns_PC[i]][columns_list[j]]**2)
            else:
                for j in range(0,9):
                    sum[columns_list[j]][0] += loadings[columns_PC[i]][columns_list[j]]**2
        sorted_sum = sorted(sum.items(), key=lambda x: x[1], reverse=True)
        features = []
        for i in range(0,4):
            features.append(sorted_sum[i][0])
        pca_comp = loadings[columns_PC[:top_value]].T[features].T
    else:
        sum = defaultdict(list)
        for i in range(0,9):
            if i==0:
                for j in range(0,9):
                    sum[columns_list[j]].append(loadings[columns_PC[i]][columns_list[j]]**2)
            else:
                for j in range(0,9):
                    sum[columns_list[j]][0] += loadings[columns_PC[i]][columns_list[j]]**2
        sorted_sum = sorted(sum.items(), key=lambda x: x[1], reverse=True)
        features = []
        for i in range(0,4):
            features.append(sorted_sum[i][0])
        pca_comp = loadings.T[features].T
   
    pca_comp['Squared Sum PCA Loadings']= sorted_sum[:4]
    pca_comp['Squared Sum PCA Loadings'] = pca_comp['Squared Sum PCA Loadings'].apply(lambda x: x[1][0])

    df['kmeans_color'] = kmeans_res.tolist()
    features_ = features + ['kmeans_color']
    df_scatter = df[features_].T
    rangeDom = {}
    features_dict = {v: k for v, k in enumerate(features)}
    for i in features:
        rangeDom[i] = {"mn":min(df[i]),"mx":max(df[i])}
    obj_ = {
        'data':list(df_scatter.to_dict().values()),
        'table_data':pca_comp.to_dict(),
        'table_data_sup':pca_comp.T.to_dict(),
        'domainRange':rangeDom,
        'features':features_dict
    }
    return jsonify(json.dumps(obj_))

df_mds = df.copy()
df_mds['color'] = kmeans_res.tolist()
data_without_clusters = scalar.fit_transform(df_mds[columns_])
mds_data = manifold.MDS(n_components=2, metric= True, dissimilarity="euclidean").fit_transform(data_without_clusters)
mds_data = np.hstack((mds_data, df_mds['color'].to_numpy().reshape(-1,1)))
df_mds = pd.DataFrame(mds_data, columns=['first','second','color'])

@app.route('/mds_data')
def mds_euclidian():
    return jsonify(df_mds.to_dict())

df_mds_var = df.copy()
df_mds_var = 1 - abs(df_mds_var[columns_].corr())
mds_data_data = manifold.MDS(n_components=2, metric= True, dissimilarity="precomputed").fit_transform(df_mds_var)
mds_data_df = np.hstack((mds_data_data, df_mds_var.columns.to_numpy().reshape(-1,1)))
df_mds_var = pd.DataFrame(data = mds_data_df, columns=['first','second','name'])

@app.route('/mds_var', methods=['GET', 'POST'])
def mds_var():
    global pcp_key
    if request.method == 'POST':
        pcp_key = request.get_json()
        pcp_key = pcp_key['key']
    df_mds_pcp = df.copy()
    df_mds_pcp['color'] = kmeans_res.tolist()
    df_mds_pcp = df_mds_pcp.T
    obj_ = {
        'data':df_mds_var.to_dict(),
        'data_pcp':list(df_mds_pcp.to_dict().values())
    }
    return jsonify(json.dumps(obj_))

@app.route('/pcp')
def pcp():
    selected_columns = ['attack', 'base_egg_steps', 'base_happiness', 'base_total', 'capture_rate', 'defense', 'experience_growth', 'height_m', 'hp', 'percentage_male','sp_attack', 'sp_defense', 'speed', 'type1', 'type2', 'weight_kg', 'generation', 'is_legendary']
    df_pcp = df_test[selected_columns]
    df_pcp['color'] = kmeans_res.tolist()
    df_pcp = df_pcp.T
    obj_ = {
        'data':list(df_pcp.to_dict().values()),
        'name':df_test['name'].tolist()
    }
    return jsonify(json.dumps(obj_))

@app.route('/mds_pcp')
def mds_pcp():
    df_mds_pcp = df[pcp_key]
    df_mds_pcp['color'] = kmeans_res.tolist()
    df_mds_pcp = df_mds_pcp.T
    obj_ = {
        'data':list(df_mds_pcp.to_dict().values()),
        'name':df_test['name'].tolist()
    }
    return jsonify(json.dumps(obj_))

if __name__ == '__main__':
    app.run(debug=True)
