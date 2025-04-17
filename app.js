import {main as processWithAi} from "./openAi-integration.js";

(function checkAuth(){
    const userData=localStorage.getItem('userData')
    if(!userData){
        window.location.replace('login.html')
        return;
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const userData=localStorage.getItem('userData')
    if(!userData){
        window.location.replace('login.html')
        return;
    }

    const voiceButton = document.querySelector(".voice-btn");
    if (voiceButton) {
        voiceButton.addEventListener("click", startListening);
    }

    clearTaskOutput();
    updateTaskList();

    const logoutBtn=document.getElementById('logoutBtn')
    if(logoutBtn){
        logoutBtn.addEventListener('click',()=>{
            localStorage.removeItem('userData')
            window.location.replace('login.html')
        })
    }
})

function setDataToLocalStorage(userId){
    localStorage.setItem('userData',userId)
}

function clearTaskOutput(){
    const taskInfo=document.querySelector('.task-information');
    if(taskInfo){
         document.getElementById('operation').textContent=''
        document.getElementById('task').textContent=''
        document.getElementById('urgency').textContent=''
        document.getElementById('dateTime').textContent=''
    }
    const confirmationArea=document.getElementById('confirmation-area')
    if(confirmationArea){
        confirmationArea.textContent=''
    }
}

function startListening() {
    if ("webkitSpeechRecognition" in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang="en-US";

        recognition.onstart= function () {
            console.log("Listening...");
            clearTaskOutput()
        }
        recognition.onresult = function (event) {
            const transcript=event.results[0][0].transcript;
            console.log("got transcript");
            processCommand(transcript);
        }
        recognition.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
        }
        recognition.start()
    }
    else {
        alert("Your browser does not support Web Speech API.");
        return;
    }
}

function getUrgencyColor(color) {
    if(color==null){
        return;
    }
    switch(color.toLowerCase()){
        case 'high':
            return "#FF0000";
        case 'medium':
            return '#FFA500';
        case 'low':
            return "#008000";
        default:
            return '#808080';
        
    }
}

function updateTaskList(){
    const todoList=document.getElementById("todo-list");
    todoList.innerHTML=''
    const taskStore=new Map();
    getTasksFromDb().then((tasks)=>{
        if(Array.isArray(tasks)){
            taskStore.forEach((taskData,key)=>{
                const listItem=document.createElement("div");
                listItem.classList.add("todo-item");

                const statusIndicator=document.createElement("div");
                statusIndicator.classList.add("status-indicator");
                statusIndicator.style.backgroundColor=getUrgencyColor(taskData.urgency);

                const taskContent=document.createElement('div');
                taskContent.classList.add('task-content');

                const taskTitle =document.createElement('div');
                taskTitle.classList.add('task-title');
                taskTitle.ATTRIBUTE_NODE.innerHTML=`<span class="operation-badge' style='background-color:
                ${getUrgencyColor(taskData.urgency)}'>${taskData.operation}</span>
                <span class="task-name">${taskData.task}</span>
                `

                const taskDetails=document.createElement('div')
                taskDetails.classList.add('task-details-line');
                taskDetails.innerHTML=`<span class="urgency-badge' style='background-color:
                ${getUrgencyColor(taskData.urgency)}'>${taskData.task}</span>
                ${taskData.dateTime}?<span class='dateTime'>${taskData.dateTime}</span>:''}
                `

                taskContent.appendChild(taskTitle);
                taskContent.appendChild(taskDetails);
                const completeButton=document.createElement('button');
                completeButton.classList.add('complete-btn');
                completeButton.innerHTML=''
                completeButton.title='Mark as finished'
                completeButton.onclick=()=>{
                    try {
                        const response=fetch(`http://localhost:8080/api/task/delete/${taskData.id}`,{
                            method:'DELETE',
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            }
                        })

                        if(!response.ok){
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                    } 
                    catch (error) {
                        console.error("Error deleting task:", error);
                        alert("Error deleting task. Please try again.");
                    }
                }
                listItem.appendChild(statusIndicator);
                listItem.appendChild(taskContent);
                listItem.appendChild(completeButton);

                todoList.appendChild(listItem);
            });
        }
        else{
            console.error("Invalid task data format:", tasks);
        }
    }).catch((error)=>{
        console.error("Error fetching tasks:", error);
    })
}

async function processCommand(command) {
    try {
        const aiResponse=await processWithAi(command)
        const userData=getUserData()
        if(!userData){
            throw new Error("User data not found in local storage.");
        }
        const requestBody={
            operation: aiResponse.operation,
            task: aiResponse.task,
            urgency: aiResponse.urgency,
            dateTime: aiResponse.dateTime,
            userId:userData.id
        }

        document.getElementById('operation').textContent=aiResponse.operation;
        document.getElementById('task').textContent=aiResponse.task;
        document.getElementById('urgency').textContent=aiResponse.urgency;
        document.getElementById('dateTime').textContent=aiResponse.dateTime?aiResponse.dateTime:'';
        const confirmationArea=document.getElementById('confirmation-area')
        confirmationArea.innerHTML=`
        <div class="confirmation-button">
            <p>Is this correct?</p>
            <button class="confirmation-btn" onclick="addTask()">Yes</button>
            <button class="confirmation-btn" onclick="clearTaskOutput()">No</button>
        </div>
        `;
        
        window.confirmTask=async (isCorrect)=>{
            if(isCorrect){
                clearTaskOutput()
                const response=await fetch("http://localhost:8080/api/task/add",{
                    method:'POST',
                    headers:{
                        "Content-type":"application/json",
                        "Accept":"application/json"
                    },
                    body:JSON.stringify(requestBody)
                })
                if(!response.ok){
                    console.log("request unsuccessful")
                    throw new Error(`Http error with status code: ${response.status}`)
                }
                const responseData=await response.json 
                return responseData;
            }
            else{
                console.log("Wrong input");
                clearTaskOutput();
                startListening();
            }
        }
        
    } 
    catch (error) {
        console.error(error);
        return null;
    }
}

function getUserData(){
    const userData=localStorage.getItem('userData')
    return userData?JSON.parse(userData):null;
}
async function getTasksFromDb() {
    try {
        const userData = getUserData();
        if (!userData) {
            throw new Error("User data not found in local storage.");
        }
        const response = await fetch(`http://localhost:8080/api/task/find/userId=${userData.id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error("Error fetching tasks:", error); 
        return new Map(); // Return an empty map in case of error
    }
}