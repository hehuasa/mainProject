export default
{
  "entry": "src/index.js",
  "extraBabelPlugins": [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }]
  ],
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr"
      ]
    }
  },
  "proxy": {
    "/emgc": {
      // "target": "http://10.157.24.55:8080/",
      "target": "http://192.168.0.6:8080/",
      "changeOrigin": true,
      "pathRewrite": { "^/emgc": "" }
    },
    "/mapApi": {
        "target": "http://192.168.0.6:80/arcgis/arcgis_js_api/library/4.9",
        "changeOrigin": true,
        "pathRewrite": { "^/mapApi": "" }
    },
  },
  "ignoreMomentLocale": true,
  "theme": "./src/theme.js",
  "html": {
    "template": "./src/index.ejs"
  },
  "publicPath": "/",
  "disableDynamicImport": true,
  "externals": {
    "jQuery": "window.jquery",
  },
  "hash": true
}
