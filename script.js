//Globals
const synth = window.speechSynthesis;
const speech = new SpeechSynthesisUtterance();
let voices = []
let selectedVoice = ''
let volumeLevel = 1;
let rateLevel = 1;
let pitchLevel = 1;

//Selectors
const jokeContainer = document.getElementById('joke-container')
const customContainer = document.getElementById('user-container')
const jokeBtn = document.getElementById('joke-button')
const customBtn = document.getElementById('custom-button')
const backBtn = document.getElementById('back-btn')
const voicesMenu = document.getElementById('voice-select')
const addedText = document.getElementById('input-text')
const playBtn = document.getElementById('play-btn')
const pauseBtn = document.getElementById('pause-btn')
const stopBtn = document.getElementById('stop-btn')
const resumeBtn = document.getElementById('resume-btn')
const volume = document.getElementById('Volume')
const rate = document.getElementById('Rate')
const pitch = document.getElementById('Pitch')




//Fetch all voices and populate the dropDown
initVoices = async () => {
    const getVoices = () => {
        return new Promise(resolve => {
            window.speechSynthesis.onvoiceschanged = e => {
                resolve(voicesMenu.innerHTML = window.speechSynthesis.getVoices().map(voice => {
                    return `<option>${voice.name}</option>`
                }).join(''))
                resolve(voices = window.speechSynthesis.getVoices(), selectedVoice = voices[0]);
            }
        })
    }
    await getVoices();
};

//Fetch Joke

getJoke = async () => {
    const apiURL = 'https://v2.jokeapi.dev/joke/Any'
    let joke
    try {
        const response = await fetch(apiURL)
        let data = await response.json()

        if (data.setup) {
            joke = [data.setup, data.delivery]
        } else {
            joke = data.joke
        }
        tellMeAJoke(joke)
        disableJokeBtn()
    } catch (e) {
        throw new Error(`Uh Oh! encountered an error: ${e}`)
    }
}

//Send the joke to the Speech API

tellMeAJoke = (joke) => {
    speech.lang = 'en'
    speech.voice = voices[1]
    speech.volume = volumeLevel
    speech.rate = rateLevel
    speech.pitch = pitchLevel
    if (Array.isArray(joke)) {
        jokeBtn.disabled = true
        speech.text = joke[0]
        synth.speak(speech)
        setTimeout(() => {
            speech.text = joke[1]
            synth.speak(speech)
        }, 1000)
    } else {
        speech.text = joke
        synth.speak(speech)
    }

}


//Grab the voice object
getVoice = (name, arr) => {
    for (const voice of arr) {
        if (name === voice.name) {
            return selectedVoice = voice
        }
    }
}


play = () => {
    if (!synth.speaking) {
        speech.lang = 'en'
        speech.text = addedText.value
        speech.voice = selectedVoice
        speech.volume = volumeLevel
        speech.rate = rateLevel
        speech.pitch = pitchLevel
        synth.speak(speech)
    } else {
        alert(`You already have a speech playing. Click "Resume" to continue, or "Stop" to add new speech`)
    }
}

showCustomContainer = () => {
    jokeContainer.classList.add('hide')
    customContainer.classList.remove('hide')
}

showJokeContainer = () => {
    jokeContainer.classList.remove('hide')
    customContainer.classList.add('hide')
}

checkSelectedVoice = (e) => {
    getVoice(e.target.value, voices)
}

disableJokeBtn = () => jokeBtn.disabled = true
enableJokeBtn = () => jokeBtn.disabled = false

//Event Listeners
jokeBtn.addEventListener('click', getJoke)
customBtn.addEventListener('click', showCustomContainer)
backBtn.addEventListener('click', showJokeContainer)
voicesMenu.addEventListener('change', checkSelectedVoice)
playBtn.addEventListener('click', play)
pauseBtn.addEventListener('click', () => {
    synth.pause()
})
resumeBtn.addEventListener('click', () => {
    synth.resume()
})
stopBtn.addEventListener('click', () => {
    synth.cancel()
})
volume.addEventListener('input', (e) => {
    volumeLevel = +e.target.value
})
rate.addEventListener('input', (e) => {
    rateLevel = +e.target.value
})
pitch.addEventListener('input', (e) => {
    pitchLevel = +e.target.value
})
speech.addEventListener('end', enableJokeBtn)
speech.addEventListener('start', disableJokeBtn)

//onLoad
initVoices()

