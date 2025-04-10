

const config={
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        redirectedUri:"http://127.0.0.1:5500/auth/google/callback.html/"
    },
    facebook:{
        clientID:"",
        redirectedUri:""
    }
}

function openPopup(url,width=500,height=600){
    const left=(window.innerWidth)/2
    const top=(window.innerHeight)/2
    return window.open(url,"Social Login",`width=${width},height=${height},top=${top},left=${left}`)
}

function initGoogleSignIn(){
    const googleButton=document.querySelector('.social-button[title="Login with Google"]')
    if(googleButton){
        googleButton.addEventListener('click',()=>{
            const authUrl=`https://accounts.google.com/o/oauth2/v2/auth?`+
            `client_id=${config.google.clientID}`+
            `&redirect_uri=${encodeURIComponent(config.google.redirectedUri)}`+
            `&response_type=code`+
            `&scope=${encodeURIComponent("email profile")}`+
            `&access_type=offline`+
            `&prompt=consent`;

            const popup=openPopup(authUrl)
            if(popup){
                window.addEventListener("message",handleGoogleCallback)
            }
        })
    }
}

function handleGoogleCallback(event){
    if(event.origin !== window.location.origin){
        return;
    }
    
    if(event.data.type === 'google-auth-success'){
        const{code,userData}=event.data;
        handleSocialLoginSuccess('google',code,userData)
    }
}

async function handleSocialLoginSuccess(provider,code,userData){
    try {
        const loadingOverlay=document.querySelector('loading-overlay')
        if(loadingOverlay){
            loadingOverlay.style.display='flex';
        }
        const response=await fetch(`http://localhost:8080/api/auth/social-login`,{
            method: 'POST',
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json"
            },
            body: JSON.stringify({provider,code,userData})
        });
        if(!response.ok){
            throw new Error("Failed to authenticate with social provider")
        }
        const data=await response.json();
        if(data.token){
            localStorage.setItem('authToken',data.token)
            localStorage.setItem('userData',JSON.stringify(data.user))
            window.location.href='/dashboard.html';
        }
        else{
            throw new Error("Authentication failed")
        }
        
    } catch (error) {
        console.error("Social login error "+error);
        showError("Failed to login. Please try again.")
    }
    finally{
        const loadingOverlay=document.querySelector('loading-overlay')
        if(loadingOverlay){
            loadingOverlay.style.display='none';
        }
    }   
}

function showError(message){
    const errorMessage=document.getElementById('error-message')
    if(errorMessage){
        errorMessage.textContent=message
        errorMessage.style.display='block'
        setTimeout(()=>{
            errorMessage.style.display='none'
        },5000)
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    initGoogleSignIn()
    // const userData=localStorage.getItem('userData')
    // if(userData){
    //     window.location.href='index.html';
    // }
});