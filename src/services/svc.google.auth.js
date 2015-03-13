angular.module('com.larcity.google.authSvc',[])
.factory('$googleAuthService', ['$http','$rootScope','$extensionService', '$contextService', '$window', 
function($http,$rt,ex,context,$w) {
        
        ex.log("[module.service.googleAuthService]");

        var READY = false;

        var XLoader = setInterval(function() {
            if(gapi.client) {
                gapi.auth.init(function() {
                    ex.log("Google auth client is ready");
                    $rt.$emit('app:GoogleAuthClientIsReady', true);
                    READY = true;
                });
                clearInterval(XLoader);
            }
        }, 500);
        /*
        var cfg = {
            clientId: "593862168164-hkgjsesar1g54vl9spihovq108e302ph.apps.googleusercontent.com",
            apiKey: "AIzaSyAtTRtfO4j6b7vnDgs9tpZVOny2Sv-ezds",
            // scopes: "profile email https://www.googleapis.com/auth/plus.login",
            scopes: "profile email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/youtube"
        };
        */
        var GOOGLE_USER_KEY = APP_KEY+".google_oauth2_user";
        var AUTHORIZING = false;
        
        var Loader = null;
        var Authorization = null;
        var AuthError = false;
        var AuthType = 'google_oauth2';
        var NotAuthorized = true;
        var GoogleUser = null;
        var LoginCallback = false;
        
        /** Method required for each platform integration to ensure access credentials for authenticating/supporting 
         * platform is captured and available when needed **/
        var localAuth = function() {
            $rt.$emit('app:updateStatus', { message: 'Looking up your account information...', color: '#999' });
            var rq = {
                url: context.api_link('user/auth/' + AuthType),
                method: 'POST',
                data: $.param({
                    GoogleUser: GoogleUser
                })
            };
            ex.log(rq, 'Attempt Shadowbox auth (POST)');
            $http(rq)
                    .success(function(data) {
                        $rt.$emit('app:clearStatus');
                        ex.log(arguments, 'Shadowbox user');
                        if(data.user) {
                            data.user.AuthType = AuthType;
                            $rt.$emit('app:setUser', data.user);
                            if(angular.isFunction(LoginCallback)) {
                                LoginCallback();
                            }
                        }
                    })
                    .error(function(data, status) {
                        $rt.$emit('app:clearStatus');
                        ex.log(arguments, 'Shadowbox user ERR');
                        try {
                            if(status === 404 && data.status_msg.toLowerCase() === 'no user found') {   
                                // new user
                                $w.location = context.app_link('Signup');
                            }
                        } 
                        catch(exc) {
                            ex.log(exc);
                        }
                    });
        };
        
        var bare_essentials = function( user ) {
            // collate storage
            var paramsToKeep = ['access_token','client_id','expires_at','expires_in'];
            var userInfo = {
                Type: "google_drive",
                Authorization: {},
                Token: {
                    access_token: user.Authorization.access_token,
                    client_id: user.Authorization.client_id,
                    created: user.Authorization.issued_at,
                    issued_at: user.Authorization.issued_at,
                    expires_at: user.Authorization.expires_at,
                    expires_in: user.Authorization.expires_in,
                    state: user.Authorization.scope
                }
            };
            angular.forEach(paramsToKeep, function(param) {
                userInfo.Authorization[param] = user.Authorization[param];
            });
            ex.log(userInfo, "Bare essentials >>");
            return userInfo;
        };
        
        var handleAuthResult = function(authResult) {
            AUTHORIZING = false;
            var x=this;
            ex.log(authResult, 'Authorization result');
            //var authorizeButton = document.getElementById('authorize-button');
            if (authResult && !authResult.error) {
                //authorizeButton.style.visibility = 'hidden';
                Authorization = authResult;
                Loader = setInterval(function() {
                    if(gapi.client) {
                        clearInterval(Loader);
                        profile();
                    }
                }, 1200);
                // setTimeout(profile, 1200);
                NotAuthorized=false;
            } else {
                  //authorizeButton.style.visibility = '';
                  //authorizeButton.onclick = this.handleAuthClick;
                  AuthError = true;
            }
            $rt.$emit('app:clearStatus');
        };
        /**
         * 
         * @param {type} config = { errorCallback: function() {}; }
         * @returns {undefined}
         */
        var profile = function( config ) {
            var rq = {
                url: context.wiap_link('api/1.1/account/login/') + $rt.Client.client_id,
                method: 'POST',
                data: {
                    ssoPacket: JSON.stringify({
                        user: {
                            Authorization: Authorization
                        },
                        platform: 'google_drive'
                    })
                }
            };
            ex.log(rq, 'POSTing');
        };
        
        var svc= {
            getToken: function() {
                //return gapi.auth.getToken();
                if(GoogleUser.Authorization) {
                    return {
                        access_token: GoogleUser.Authorization.access_token,
                        created:GoogleUser.Authorization.issued_at,
                        expires_at:GoogleUser.Authorization.expires_at,
                        expires_in: GoogleUser.Authorization.expires_in
                    };
                }
            },
            handleClientLoad: function( callback ) {
                /*
                if(angular.isFunction(callback)) {
                    LoginCallback = callback;
                }
                var x=this;
                $rt.$emit('app:updateStatus', { message: 'Refreshing Google Credentials...' });
                Loader = setInterval(function() {
                    if(gapi.client) {
                        clearInterval(Loader);
                        gapi.client.setApiKey(cfg.apiKey);
                        x.checkAuth();
                    }
                }, 500);
                */
               ex.log("handleClientLoad() decommissioned!");
            },
            getAuthURL: function( callback ) {
                if(!$rt.Application) {
                    ex.showToast("There is a problem with your application configuration. \
                        No valid app was found to authenticate against. Contact your administrator",{has_error:true});
                } else if(!$rt.Application.app_key) {
                    ex.showToast("Your app_key is required to complete a Google Authentication. \
                    Contact your administrator to update your application settings.",{has_error:true});
                } else {
                    var rq = {
                        url: context.wiap_link('api/1.1/oauth/google_redirect/') + $rt.Application.app_key + '?' + $.param({
                            redirect_uri: encodeURIComponent(context.coreapp_link('auth_callback.html?platform=google')) /** @Important set redirect_uri **/
                        }),
                        method: 'GET'
                    };
                    ex.log(rq, 'GETting');
                    $http(rq)
                            .success(function(data) {
                                ex.log(data.oauth_url, 'auth url RESP');
                                $rt.GOOGLE_AUTH_URL = data.oauth_url;
                                $rt.$emit('app:googleAuthUrlIsAvailable', data.oauth_url);
                                if(angular.isFunction(callback)) 
                                    callback(data.oauth_url);
                            })
                            .error(function(data) {
                                ex.showToast(data.status_msg || "Authentication aborted. Unable to obtain Google redirect URL for app",{has_error:true});
                            });
                }
            },
            auth: function() {
                $rt.$emit('app:showModal',{message:'Logging in via your Google Account...',type:'wait'});
                var x=this;
                AUTHORIZING = true;
                // get google redirect url
                // ex.log($rt.Application, 'app to auth against');
                if(!$rt.Application) {
                    ex.showToast("There is a problem with your application configuration. \
                        No valid app was found to authenticate against. Contact your administrator",{has_error:true});
                } else if(!$rt.Application.app_key) {
                    ex.showToast("Your app_key is required to complete a Google Authentication. \
                    Contact your administrator to update your application settings.",{has_error:true});
                } else {
                    var rq = {
                        url: context.wiap_link('api/1.1/oauth/google_redirect/') + $rt.Application.app_key + '?' + $.param({
                            redirect_uri: encodeURIComponent(context.coreapp_link('auth_callback.html?platform=google')) /** @Important set redirect_uri **/
                        }),
                        method: 'GET'
                    };
                    ex.log(rq, 'GETting');
                    $http(rq)
                            .success(function(data) {
                                ex.log(data.oauth_url, 'auth url RESP');
                                if(data.oauth_url) {
                                    window.location.href = data.oauth_url;
                                }
                            })
                            .error(function(data) {
                                ex.showToast(data.status_msg || "Authentication aborted. Unable to obtain Google redirect URL for app",{has_error:true});
                            });
                    /*
                    gapi.auth.authorize({client_id: cfg.clientId, scope: cfg.scopes }, x.handleAuthResult);
                    */
                }
            },
            checkAuth: function() {
               var x=this;
                $rt.$emit('app:updateStatus', { message: 'Checking authorization...' });
                // attempt to get token
                var user = $.jStorage.get(GOOGLE_USER_KEY);
                if(user) {
                    user = JSON.parse(user);
                    ex.log(user, "Found google user bare essentials");
                    gapi.auth.setToken(user.Token);
                    // attempt to fetch profile
                    Authorization = user.Token;
                    profile({
                        errorCallback: function() {
                            x.auth();
                        }
                    });
                } else {
                    x.auth();
                }
            },
            handleAuthResult: function(authResult) {
                handleAuthResult(authResult);
            },
            handleAuthClick: function(event, callback) {
                if(angular.isFunction(callback)) {
                    LoginCallback = callback;
                }
                var x=this;
                if(NotAuthorized) {
                    $rt.$emit('app:updateStatus',{message:'Authorizing...'});
                    x.auth();
                }
            },
            reset: function() {
                $.jStorage.set(GOOGLE_USER_KEY, null);
            }
        };

        $rt.$on('app:startGoogleOAuthFlow', function() {
            // svc.auth();
        });
        return svc;
}]);