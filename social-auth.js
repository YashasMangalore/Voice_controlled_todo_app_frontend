const config = {
    google: {
      clientID: "277774640910-e9f9plpr6q38ar10fo23t8cppkp413c7.apps.googleusercontent.com",
      redirectedUri: "http://localhost/auth/google/callback.html"
    },
    facebook: {
        appId: "YOUR_FACEBOOK_CLIENT_ID",
        redirectedUri: window.location.origin+"/auth/facebook/callback.html"
    }
  };
  
  function openPopup(url, width = 500, height = 600) {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    return window.open(url, "Social Login", `width=${width},height=${height},top=${top},left=${left}`);
  }
  
  function initGoogleSignIn() {
    const googleButton = document.querySelector('.social-button[title="Login with Google"]');
    if (googleButton) {
      googleButton.addEventListener('click', () => {
        // e.preventDefault();
        const authUrl =`https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${config.google.clientID}` +
          `&redirect_uri=${encodeURIComponent(config.google.redirectedUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent("email profile")}` +
          `&access_type=offline` +
          `&prompt=consent`;
  
        // console.log("Redirecting to:", authUrl);
        const popup = openPopup(authUrl);
        if (popup) {
          window.addEventListener('message', handleGoogleCallback);
        }
      });
    }
  }

  function initFacebookSignIn() {
    const facebookButton = document.querySelector('.social-button[title="Login with Facebook"]');
    if (facebookButton) {
      facebookButton.addEventListener('click', () => {
        const authUrl =`https://www.facebook.com/v12.0/dialog/oauth?` +
          `client_id=${config.facebook.appId}` +
          `&redirect_uri=${encodeURIComponent(config.facebook.redirectedUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent("email public_profile")}`;
  
        const popup = openPopup(authUrl);
        if (popup) {
          window.addEventListener('message', handleFacebookCallback);
        }
      });
    }
  }

  function handleGoogleCallback(event) {
    if (event.origin !== window.location.origin) return;
  
    if (event.data.type === 'google-auth-success') {
      const { code,userData } = event.data;
      handleSocialLoginSuccess('google', code, userData);
    }
  }
  function handleFacebookCallback(event) {
    if (event.origin !== window.location.origin) return;
  
    if (event.data.type === 'facebook-auth-success') {
      const { code,userData } = event.data;
      handleSocialLoginSuccess('facebook', code, userData);
    }
  }

  async function handleSocialLoginSuccess(provider,code, userData) {
    try {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay){ 
            loadingOverlay.style.display = 'flex';
        }
        const response = await fetch('http://localhost:8080/api/auth/social-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ provider, code, userData }),
        });
        if(!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if(data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.userData)); // Store user data in local storage
          window.location.href = '/dashboard.html'; // Redirect to dashboard or another page
        }
        else {
          throw new Error("Login failed. Please try again.");
        }
    } catch (error) {
      console.error("Error during social login:", error);
      showError("An error occurred during login. Please try again.");
        
    }
    finally {
        // const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay){ 
            loadingOverlay.style.display = 'none';
        }
    }
  }
  
  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {errorDiv.style.display = 'block'}, 5000);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    initGoogleSignIn();
    initFacebookSignIn();
  });
  