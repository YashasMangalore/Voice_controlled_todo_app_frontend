import {main as processWithAi} from "./openAi-integration.js";

document.addEventListener('DOMContentLoaded', () => {
    const voiceButton = document.querySelector(".voice-btn");
    if (voiceButton) {
        voiceButton.addEventListener("click", startListening);
    }
})

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

async function processCommand(command) {
    try {
        const aiResponse=await processWithAi(command)
        const requestBody={
            operation: aiResponse.operation,
            task: aiResponse.task,
            urgency: aiResponse.urgency,
            dateTime: aiResponse.dateTime,
        }
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
    } catch (error) {
        console.error(error);
        return null;
    }
}