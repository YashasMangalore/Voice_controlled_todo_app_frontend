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
    e.preventDefault();
    isLoginMode=!isLoginMode;
    authTitle.textContent=isLoginMode?'Login':'SignUp';
    authButton.textContent=isLoginMode?'Login':'SignUp';
    toggleAuthLink.textContent=isLoginMode?"Don't have an account? Sign Up":
    "Already have an account? Login";
});



function setDataToLocalStorage(user){
    const userDataJsonString=JSON.stringify(user);
    localStorage.setItem('userData',userDataJsonString)
}

authform.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    try {
        const endpoint=isLoginMode ? '/api/auth/login' : '/api/auth/signup';
        const response=await fetch(`http://localhost:8080${endpoint}`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                // "Authorization": ""
            },
            body: JSON.stringify({email,password})
        });
        if(!response.ok){
            const errorData=await response.json();
            console.log(errorData);
        }
        const data=await response.json();
        localStorage.setItem('userData', JSON.stringify(data)); // Store user data in local storage
        window.location.href='index.html';

    } catch (error) {
        showError(error.message)
    }
})

function showError(message){
    errorMessage.textContent = message
    errorMessage.style.display = 'block'
    setTimeout(()=>{
        errorMessage.style.display = 'none'
    },3000)
}

async function generateJwt(email,password,role){
    const header={
        algorithm:"RS256",
        typ:'JWT'
    }
    const payload={
        email:email,
        password:password,
        role:role,
        iat:Math.floor(Date.now()/1000),
        exp:Math.floor(Date.now()/1000)+(60*60)
    }

    const privateKey=`------BEGIN PUBLIC KEY------
    qwjcfhgwiuf9eufuiofghjo
    ------END PUBLIC KEY------`
    try {
        const sheader=JSON.stringify(header);
        const spayload=JSON.stringify(payload);
        const sJWT=KJUR.jws.JWS.sign("RS256",sheader,spayload,privateKey);
        return sJWT;
    } catch (error) {
        console.error("Error decoding Jwt: " + error)
        throw error;
    }
    
}

function decodeJwt(token){
    try {
        const decodedToken=jwt.decode(token)
        return decodedToken;
    } catch (error) {
        console.error("Error decoding Jwt: " + error)
        return null;
    }
}

function signUsingRSA(data,key){
    return btoa(data+"_signed_with_RSA");
}

function showErrorAuth(error,statusCode){
    let errorMessageCode;
    switch(statusCode){
        case 400:
            errorMessageCode="Bad Request";
            break;
        case 401:
            errorMessageCode="Unauthorized";
            break;
        case 403:
            errorMessageCode="Forbidden";
            break;
        case 404:
            errorMessageCode="Not Found";
            break;
        case 500:
            errorMessageCode="Internal Server Error";
            break;
        default:
            errorMessageCode="Unknown Error";
    }
    const variable=document.getElementById('error-message')
    if(variable){
        variable.textContent=errorMessageCode;
        variable.style.display='block';
        setTimeout(()=>{
            variable.style.display='none';
        },3000);
    }
}