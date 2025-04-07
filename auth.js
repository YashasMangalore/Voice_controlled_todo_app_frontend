document.addEventListener('DOMContentLoaded',()=>{
    const userData=localStorage.getItem('userData');
    if(userData){
        window.location.href='index.html';
    }
});

const authform=document.getElementById('auth-form');
const authTitle=document.getElementById('auth-title');
const authButton=document.getElementById('auth-button')
const toggleAuthLink=document.getElementById('toggle-auth-link')
const errorMessage=document.getElementById('error-message')

let isLoginMode=true;

toggleAuthLink.addEventListener('click', (e)=>{
    isLoginMode=!isLoginMode;
    authTitle.textContent=
})