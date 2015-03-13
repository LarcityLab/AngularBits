/** @REQUIRES Facebook JS SDK - ONLY include on pages that utilize this service **/
angular.module('com.larcity.facebookSvc', [])
.factory('$facebookService', [ '$http', '$extensionService', '$rootScope', '$contextService', function( $http, ex, $rt, context ) {
    $.jStorage.set('FB_READY',false);
    ex.log("[module.service.wiap.facebook]");
    // access token for logged in user
    var accessToken = null;
    var tokens = [];
    var user = null;
    var permissions = [];
    var accounts = [];
    
    var engn = {
        setAccessToken: function( t ) {
            accessToken = t;
        },
        getLoginUrl: function() {
            var url= "https://www.facebook.com/dialog/oauth?" + $.param({
                client_id: $rt.Application.fb_api_key,
                redirect_uri: context.coreapp_link('auth_callback.html?') + $.param({
                    platform: 'fb'
                }),
                response_type: 'token',
                //state: '', @TODO add state for security
                scope: SCOPES.FB
            });
            ex.log(url, 'Facebook login URL');
            return url;
        },
        pluginIsReady: function() {
            return $.jStorage.get('FB_READY');
        },
        init: function() {
            window.fbAsyncInit = function() {
              FB.init({
                appId      : context.appConfig().Facebook.appId, // facebook app id
                xfbml      : false, // only turn on if there are facebook social plugins on your page
                version    : 'v2.1'
              });
              $.jStorage.set('FB_READY',true);
              $rt.$emit('app:FacebookIsReady');
            };

            (function(d, s, id){
               var js, fjs = d.getElementsByTagName(s)[0];
               if (d.getElementById(id)) {return;}
               js = d.createElement(s); js.id = id;
               js.src = "//connect.facebook.net/en_US/sdk.js";
               fjs.parentNode.insertBefore(js, fjs);
             }(document, 'script', 'facebook-jssdk'));            
        }/*,
        graph: function( c ) {
            var cfg = {
                data: null,
                method: null,
                endpoint: null,
                access_token: null,
                success: null,
                error: null,
                callback: null
            };
            if(c) {
                cfg = angular.extend(cfg, c);
            }
            FB.login(function( resp ) {
                
            }, {  });
        }*/,
        profile: function( callback ) {
            if(angular.isFunction( callback )) {
                try {
                    FB.api('/me', 'GET', { fields: 'last_name,first_name,email,permissions,link,gender,name,locale' }, callback );
                } catch(ex) {
                    ex.log(ex, 'Error calling Facebook->/me');
                }
            }
        },
        getMyPhotoAlbums: function( callback ) {
            var fxn='/me/albums';
            ex.log($rt.User.Credentials.Facebook, 'Facebook credentials');
            FB.api(fxn, 'GET', { access_token: $rt.User.Credentials.Facebook.accessToken }, function( resp ) {
                if(resp.error) {
                    ex.showToast("<strong><i class='fa fa-warning'></i> Facebook</strong> " + (resp.error.message || "There was a problem importing your list of photo albums from Facebook"),{has_error:true});
                } else {
                    ex.log(arguments, 'Facebook->'+fxn+' RESP');
                    if(angular.isFunction( callback )) 
                        callback( resp );
                }
            });
        },
        getPermissions: function() {
            if(user) {
                return user.permissions.data;
            } else {
                ex.log('Facebook user is not logged in.');
                return false;
            }
        },
        fetchAccounts: function() {
            return accounts;
        },
        checkLoginState: function( callback ) {
            FB.getLoginStatus(function(response) {
                switch( response.status ) {
                    case 'connected':
                        ex.log(response, 'fb.checkLoginState: logged in!');
                        // in business
                        if(angular.isFunction(callback)) {
                            callback.apply(null, response);
                        }
                        break;
                        
                    default:
                        // something happened
                        ex.log(response, 'fb.checkLoginState: Login failed');
                        if(angular.isFunction(callback)) {
                            callback(false);
                        }
                        break;
                }
            });
        },
        requestAccounts: function( callback ) {
            var x=this;
            // ask - assuming FB will ONLY ask when permissiosn are NOT available
            FB.login(function( resp ) {
                ex.log(arguments);
                switch(resp.status) {
                    case 'connected':
                        /** @TODO push token to server **/
                        tokens.push(resp.authResponse);
                        accessToken = resp.authResponse.accessToken;
                        try {
                            if(resp.authResponse.grantedScopes) {
                                permissions = resp.authResponse.grantedScopes.split(",");
                                // check for needed permissions
                                if(permissions.indexOf('manage_pages') < 0) {
                                    throw "You declined the request to fetch your facebook pages information.";
                                } else {
                                    $rt.$emit('fbIsReady', { user: user, permissions: permissions });
                                    FB.api('/me/accounts', 'GET', { fields: 'id,name,category,access_token,description,link,location,likes,perms,description_html,picture' }, function( resp ) {
                                        if(resp.data) {
                                            accounts = resp.data;
                                            ex.log('Got accounts!');
                                            if(angular.isFunction(callback)) {
                                                $rt.$emit('updatedFacebookAccounts', resp.data);
                                                callback(resp.data);
                                            }
                                        } else {
                                            throw "There was a problem fetching your pages: no data was returned";
                                            if(angular.isFunction(callback)) {
                                                callback(false);
                                            }
                                        }
                                    });
                                }
                            } else {
                                throw "No granted permissions found";
                            }
                        } catch(exc) {
                            ex.log(exc);
                            ex.showToast(exc, {has_error:true,trivial:false});
                            $rt.$emit('fbIsNotReady');
                            if(angular.isFunction(callback)) {
                                callback(false);
                            }
                        }
                        break;
                }
            }, { scope: SCOPES.FB , return_scopes: true });
        },
        status: function( callback ) {
            var x=this;
            FB.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                   console.log('Logged in.');
                   // get user's information
                   x.profile(function( me ) {
                       user = me;
                       callback.apply(null, arguments);
                   });
              } else {
                FB.login(function() {
                    // get user's information
                    x.profile(function( me ) {
                        user = me;
                        // pass to callback for checking status
                        callback.apply(null, arguments);
                    });
                }, { scope: SCOPES.FB, return_scopes: true });
              }
            });            
        }
    };
    // initialize facebook library
    engn.init();
    return engn;

} ]);
        