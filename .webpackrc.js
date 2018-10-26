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
      "target": "http://10.157.24.55:8080/",
      "changeOrigin": true,
      "pathRewrite": { "^/emgc": "" }
    },
    "/upload": {
      "target": "http://10.157.24.55:8080/",
      "changeOrigin": true,
      "pathRewrite": { "^/upload": "" }
    },
    "/mapApi": {
        "target": "http://10.157.5.25:8888/arcgis/arcgis_js_api/library/4.9",
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
