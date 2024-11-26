var VRButton = {
    createButton: function(gl, options) {
        if (options && options.referenceSpaceType) {
            gl.xr.setReferenceSpaceType(options.referenceSpaceType);
        }

        var button = document.createElement("button");
        button.textContent = 'Enter XR';

        function EnterVR() {
            button.innerHTML = 'Enter XR';
            var currentSession = null;

            function onSessionStarted(session) {
                session.addEventListener('end', onSessionEnded);
                gl.xr.setSession(session);
                button.textContent = 'Exit XR';
                currentSession = session;
            }

            function onSessionEnded() {
                currentSession.removeEventListener('end', onSessionEnded);
                button.textContent = 'Enter XR';
                currentSession = null;
            }

            button.onclick = () => {
                if (currentSession === null) {
                    let sessionInit = {
                        optionalFeatures: ["local-floor", "bounded-floor"]
                    };
                    navigator.xr.requestSession('immersive-vr', sessionInit)
                        .then(onSessionStarted)
                        .catch(NotFound);
                } else {
                    currentSession.end();
                }
            }
        }

        function NotFound() {
            console.log('immersive-vr mode not found');
        }

        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr')
                .then(function(supported) {
                    if (supported) { 
                        EnterVR(); 
                    } else { 
                        if (window.isSecureContext === false) {
                            console.log('WebXR needs HTTPS');
                        } else {
                            console.log('WebXR not available');
                        }
                    }
                });
        }

        return button; // Return the button so it can be appended
    }
};

export { VRButton };