
//check if browser supports service worker
//before registering the worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker
            .register('../serviceorker.js')
            .then(res => console.log('Service worker registered'))
            .catch(err => console.log('Service worker not registered', err))
    }) 
}

let clearButton = document.getElementById('clear-button');
let saveButton = document.getElementById('save-button');
let inputTitle = document.querySelector('.text-title');
let inputText = document.querySelector('.text-note');
let form = document.querySelector('form');
let darkModeToggle = document.querySelector(".switch");
let theme = localStorage.getItem('data-theme');
let output = document.querySelector(".save-box");
let localNumber = document.querySelector('.index-no');
let modal = document.querySelector('.modal');
let overlay = document.getElementById('overlay');
let notes = localStorage.getItem("note") !== null ? JSON.parse(localStorage.getItem("note")) : [];



const changeThemeToDark = () => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("data-theme","dark");
}

const changeThemeToLight = () => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("data-theme","light");
}

if(theme === "dark") {
    changeThemeToLight();
 } 

darkModeToggle.addEventListener("change", () => {
    theme = localStorage.getItem('data-theme');
    if(theme === "dark") {
        changeThemeToLight();
     } else {
        changeThemeToDark();
     }
});


class SpeechRecognitionApi {
    constructor(options) {
        const SpeechToText = window.webkitSpeechRecognition;
        this.speechApi = new SpeechToText();
        this.output = options.output ? options.output : document.createElement('div');
        this.speechApi.continuous = true;
        this.speechApi.interimResult = false;
        this.speechApi.onresult = (event) => {
            var current = event.resultIndex;
            var transcript = event.results[current][0].transcript;
            this.output.textContent += transcript;
        }
    }
    begin() {
        this.speechApi.start();
    }
}

window.onload = function() {
    var speech = new SpeechRecognitionApi({
        output:document.querySelector(".output")
    })

    document.querySelector("#mic-stand").addEventListener("click", () => {
        speech.begin();
    })
}

//save notes in localStorage
function saveNotes() {
    let notes;
    if(localStorage.getItem('note') === null) {
        notes = [];
    } else {
        notes = JSON.parse(localStorage.getItem('note'));
    }
    return notes;
}


//function to delete a particular item from the localStorage
function deleteNoteInLocalstorage(id) {
    const notes = saveNotes();
    notes.forEach((note, index) => {
        if(note.id === id) {
            notes.splice(index, 1);
        }
        localStorage.setItem('note', JSON.stringify(notes));
    })
}


//function to display note
function displayNotes(note) {
    const notes = saveNotes();
    let save = "";
    
    notes.forEach(note => {
        save += `
        <div class="saved-inputs">
           <span hidden>${note.id}</span>
           <P class="saved-title">
             ${note.title}
           </P>
           <p class="saved-text">
             ${note.text}
           </p>
           <p class="current-date">${note.date}</p>
           <button class="view-button">View</button>
          <button class="delete-button">Delete</button>
       </div> `;
    });
       if (notes.length != 0) {
            output.innerHTML = save;
            localNumber.textContent = `${notes.length}`;
        } else {
            output.innerHTML = "no notes inputted ,please fill in the text field";
        }
}

function editNote(id) {
    if (inputTitle.value.length < 0 && inputText.value.length < 0) {
        const currentTitle = document.querySelector('.saved-title').textContent;
        const currentBody = document.querySelector('.saved-text').textContent;
        inputTitle = document.querySelector('.text-title');
        inputText = document.querySelector('.text-note');

        inputTitle.value = currentTitle;
        inputText.value = currentBody;

        const notes = saveNotes();
        notes.forEach((note, index) => {
            if(note.id === id) {
                notes.splice(index, 1);
            }
            localStorage.setItem('note', JSON.stringify(notes));
        })
        window.location.assign('notes/add.html')
    } else {
        alert('please clear the input field')
    }
    
}

//function that activates the modal
function activateModal(title, body) {
    let modalTitle = document.querySelector('.title');
    let modalText = document.querySelector('.modal-body');
    modalTitle.textContent = title;
    modalText.textContent = body;
    modal.classList.add('display');
    overlay.classList.add('display');
}

// function for the times button to close modal
const modalBtn = document.querySelector('.close-button').addEventListener("click",() => {
    modal.classList.remove('display');
    overlay.classList.remove('display');
})


//working on the buttons
output.addEventListener("click",(e) => {
    if(e.target.classList.contains('view-button')) {
        const presentNote = e.target.closest('.saved-inputs');
        const presentTitle = presentNote.querySelector('.saved-title').textContent;
        const presentBody = presentNote.querySelector('.saved-text').textContent;
        activateModal(presentTitle,presentBody);
    }

    if(e.target.classList.contains('delete-button')) {
        const presentNote = e.target.closest('.saved-inputs');
        presentNote.remove();
        const id = presentNote.querySelector('span').textContent;//since textcontent is used the id is returned as a string
        deleteNoteInLocalstorage(Number(id));//using the Number keyword to make the id a number
    }   
})


document.addEventListener('DOMContentLoaded', displayNotes());

let noteSearch = document.querySelector('#search-input');

//filter through notes
noteSearch.addEventListener("keyup", filterNotes);

function filterNotes() {
    let filterValue = noteSearch.value.toLowerCase();
    const filter = document.querySelectorAll(".saved-inputs").forEach(note => {
        note.innerText.toLowerCase().indexOf(filterValue) > -1 ? note.style.display = "" : note.style.display = "none";
    })
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let noteDate = new Date;

function addNewNote() {
    const newNote = {
                id:Date.now(),
                title:inputTitle.value,
                text:inputText.value,
                date:`${noteDate.toLocaleTimeString()} on ${days[noteDate.getDay()]}, ${noteDate.getDate()} ${months[noteDate.getMonth()]} ${noteDate.getFullYear()}`
    }
    
    notes.push(newNote);
    localStorage.setItem('note', JSON.stringify(notes));
    saveNotes();
    displayNotes(newNote);
    inputTitle.value = "";
    inputText.value = "";
    inputTitle.focus();
}
//submit form
saveButton.addEventListener("click", (e) => {
    e.preventDefault();
    //validate the inputs
    if(inputTitle.value.length < 0 && inputText.value.length < 0) {
        // const newNote = new Note(inputTitle.value, inputText.value);//calling the class 
        alert('input the text field');
    } else {
        addNewNote(inputTitle.value, inputText.value)
    }      
})


