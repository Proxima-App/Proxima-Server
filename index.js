var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require( 'parse-dashboard' )
var path = require('path');

if (!process.env.DATABASE_URI) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY,
  clientKey: process.env.CLIENT_KEY,
  serverURL: process.env.SERVER_URL,
});

const dashboard = new ParseDashboard( {
  'apps': [
    {
      'serverURL': process.env.SERVER_URL,
      'publicServerURL' : process.env.SERVER_URL,
      'appName': process.env.APP_NAME,
      'appId': process.env.APP_ID,
      'masterKey': process.env.MASTER_KEY
    }
  ],
  'users': [
    {
      'user': process.env.DASHBOARD_ADMIN_USERNAME,
      'pass': process.env.DASHBOARD_ADMIN_PASSWORD
    }
  ]
}, { allowInsecureHTTP: true } )

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var serverMountPath = process.env.SERVER_MOUNT || '/parse';
app.use(serverMountPath, api);

// serve the Parse Dashboard on the /dashboard URL prefix
var dashboardMountPath = process.env.DASHBOARD_MOUNT || '/dashboard';
app.use( dashboardMountPath, dashboard )

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Proxima Parse Backend');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('Proxima Parse Server & Dashboard running on port ' + port + '.');
});

// This will enable the Live Query real-time server
//ParseServer.createLiveQueryServer(httpServer);
