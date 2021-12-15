
//check if browser supports service worker
//before registering the worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker
            .register('../serviceWorker.js')
            .then(res => console.log('Service worker registered'))
            .catch(err => console.log('Service worker not registered', err))
    }) 
}

//defining the needed variables
let clearButton = document.getElementById('clear-button');
let saveButton = document.getElementById('save-button');
let inputTitle = document.querySelector('.text-title');
let inputText = document.querySelector('.text-note');
let presentTime = document.querySelector('.current-date');
let form = document.querySelector('form');
let darkModeToggle = document.querySelector(".switch");
let theme = localStorage.getItem('data-theme');
let output = document.querySelector(".save-box");
let notes = localStorage.getItem("note") !== null ? JSON.parse(localStorage.getItem("note")) : [];


clearButton.addEventListener('click',(e)=> {
    e.preventDefault();
    inputTitle .value = "";
    inputText.value = ""; 
})

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
        this.input = options.input ? options.input : document.createElement('div');
        this.speechApi.continuous = true;
        this.speechApi.interimResult = false;
        this.speechApi.onresult = (event) => {
            var current = event.resultIndex;
            var transcript = event.results[current][0].transcript;
            this.output.textContent += transcript;
            this.input.textContent += transcript;
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

    document.querySelector("#mic-input").addEventListener("click", () => {
        speech.begin();
    })
}

//create a class for the notes
// class Note{
//     constructor(title, body) {
//         this.title = title;
//         this.body = body;
//     }
// }

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

//add the note
function addNewNoteInLocalstorage(note) {
      const notes = saveNotes();
      notes.push(note);
      localStorage.setItem('note', JSON.stringify(notes));
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
          <button class="edit-button">Edit</button>
          <button class="delete-button">Delete</button>
       </div> `;
 });

       if (notes.length != 0) {
            output.innerHTML = save;
        } else {
            output.innerHTML = "no notes inputted ,please fill in the text field";
    }
}


document.addEventListener('DOMContentLoaded', displayNotes());

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let noteDate = new Date;

function addNewNote() {
    const newNote = {
                id:Date.now(),
                title:inputTitle.value,
                text:inputText.value,
                date:`${noteDate.toLocaleTimeString()} ${days[noteDate.getDay()]}, ${noteDate.getDate()} ${months[noteDate.getMonth()]} ${noteDate.getFullYear()}`
    }
    
    // notes.push(newNote);
    // localStorage.setItem('note', JSON.stringify(notes));
    saveNotes();
    // displayNotes(newNote);
    addNewNoteInLocalstorage(newNote);
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





