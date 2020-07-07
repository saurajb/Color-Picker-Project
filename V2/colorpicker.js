// Global selections and varaibales
const colorDivs = document.querySelectorAll('.colour-block');
const colorcontainers = document.querySelectorAll('.colour-container');
const generateBtn = document.querySelectorAll('.generate-button');
const sliders = document.querySelectorAll('input[type="range"]');
const currenthexes = document.querySelectorAll('.color-details h2');
const popupbox = document.querySelector('.popup-wrap');
const adjustmentbutton = document.querySelectorAll('.adjust');
const lockbutton = document.querySelectorAll('.lock')
const hslsliders = document.querySelectorAll('.hsl-sliders')
const logobutton = document.querySelector('.color-picker-icon')


let initialColours;
let savedPalette = [];



// add event listener
generateBtn.forEach(button =>{
    button.addEventListener("click",randomColors);
    console.log(button);
})


logobutton.addEventListener("click",randomColors);

sliders.forEach(sliders =>{
    sliders.addEventListener("input",hslcontrols);
})

colorDivs.forEach((div,index) => {
    div.addEventListener("change", () => {
        updateText(index);
    })
})

currenthexes.forEach(hex=>{
    hex.addEventListener("click",()=>{
        copytoclipboard(hex);
    })
})

popupbox.addEventListener('transitionend',()=>{
    const popup = popupbox;
    popup.classList.remove("popupactive");
})

adjustmentbutton.forEach((button,index) => {
    button.addEventListener('click', ()=>{
        openadjustmentpanel(index);
    })
})

lockbutton.forEach((button,index)=> {
    button.addEventListener("click",()=>{
        addlockclass(button, index);
    })
})




// Functions

//colour generation with chroma js
function generateHex(){
    const hexColour = chroma.random();
    return hexColour;
}


// Apply colour to container and assign value to text
function randomColors(){

    initialColours = [];
    
    colorDivs.forEach((div,index)=>{
        // accesssign the small hex
        let colouritem = div.children[0];
        let smallhexcontainer = colouritem.children[0];
        const smallhex = smallhexcontainer.children[0]; 

        // accessing the hex and colour container
        let item = div.children[2];
        let textcontainer = item.children[0]
        const colorhex = textcontainer.children[0] 
        const colorcontainer = div.children[0] 

        //random colour
        const randomcolor = generateHex()

        if (div.classList.contains("locked")){
            initialColours.push(smallhex.innerText);
            return;
        }else {
            initialColours.push(chroma(randomcolor).hex());
        }

    
        colorcontainer.style.backgroundColor = randomcolor;
        colorhex.innerText = randomcolor;
        smallhex.innerText = randomcolor;

        //initial colorize sliders
        const color = chroma(randomcolor);
        const sliders = div.querySelectorAll('.slider')
        const hue = sliders[0];
        const brightness = sliders[2];
        const saturation = sliders[1];


        checkcontrast(randomcolor,smallhex);
        colorisesliders(randomcolor,hue,brightness,saturation);
    })

    resetinputs();
}


//check colour contrast
function checkcontrast(colour,text){
    let luminance = chroma(colour).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else{
        text.style.color = "white";
    }
}


//colorise sliders
function colorisesliders(color,hue,brightness,saturation){
    
    const nosat = color.set("hsl.s",0);
    const fullsat = color.set("hsl.s",1);
    const scaleSat = chroma.scale([nosat,color,fullsat]);

    const midbright = color.set("hsl.s",0.5);
    const scalebright = chroma.scale(["black",midbright,"white"]);

    brightness.style.background =`linear-gradient(to right,${scalebright(0)},${scalebright(0.2)},${scalebright(1)})`;
    saturation.style.background = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    hue.style.background = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}



// sliders to change the selected colour
function hslcontrols(e){
    
    const index = 
    e.target.getAttribute("data-hue") || 
    e.target.getAttribute("data-sat") || 
    e.target.getAttribute("data-light");

    let hslsliders = e.target.parentElement;
    let sliderparent = hslsliders.parentElement;
    let slidercontainer = sliderparent.parentElement.querySelectorAll('input[type="range"]');


    const hue = slidercontainer[0];
    const saturation = slidercontainer[1];
    const brightness = slidercontainer[2];
   

    const bgcolor = initialColours[index];

    let color = chroma(bgcolor)
        .set("hsl.s",saturation.value)
        .set("hsl.l",brightness.value)
        .set("hsl.h",hue.value);

    colorcontainers[index].style.backgroundColor = color;

    colorisesliders(color,hue,brightness,saturation);
    
}



//change text on slider pos change
function updateText(index){
    
    const activediv = colorcontainers[index];
    const color = chroma(activediv.style.backgroundColor);

    const textHex = activediv.querySelector('h2');
    const mainhex = currenthexes[index];
    mainhex.innerText = color.hex();
    textHex.innerText = color.hex();

    checkcontrast(color,textHex);
}




// reset all the inputs to corresponding color
function resetinputs() {
    const allsliders = document.querySelectorAll(".slider");
    
    allsliders.forEach(slider=>{
        if(slider.name === 'hue'){
            const huecolor = initialColours[slider.getAttribute(`data-hue`)];
            const hueValue = chroma(huecolor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'brightness'){
            const brightcolor = initialColours[slider.getAttribute(`data-light`)];
            const brightValue = chroma(brightcolor).hsl()[2];
            slider.value = Math.floor(brightValue*100)/100;
        }
        if(slider.name === 'saturation'){
            const satcolor = initialColours[slider.getAttribute(`data-sat`)];
            const satValue = chroma(satcolor).hsl()[1];
            slider.value = Math.floor(satValue*100)/100;
        }

    })

}



// copy hex to clipboard
function copytoclipboard(hex){
    const element = document.createElement("textarea");
    element.value = hex.innerText;
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);

    const popup = popupbox;
    popup.classList.add("popupactive");
    
}

//open and close toggle panel
function openadjustmentpanel(index){
    hslsliders[index].classList.toggle("hslactive");
}


//add lock class
function addlockclass(button, index){
    lockbutton[index].classList.toggle("lockactive");
    colorDivs[index].classList.toggle("locked");
}


// saving and retrieving the pallettes also
const savebtn = document.querySelector('.save-button');
const submitsave = document.querySelector('.save-palette-button');
const closesave = document.querySelector('.cancel-button-text');
const savecontainer = document.querySelector('.save-palette-flyout');
const saveinput = document.querySelector('.savename-input');


//save flyout event listeners
savebtn.addEventListener('click', togglesaveflyout);
closesave.addEventListener('click',togglesaveflyout);
submitsave.addEventListener('click',opensaveflyout);


function togglesaveflyout(e){
    savecontainer.classList.toggle("saveactive");
}


function opensaveflyout(e){
    savecontainer.classList.toggle("saveactive");
    const palettename = saveinput.value;
    const colors =[];
    currenthexes.forEach(hex => {
        colors.push(hex.innerText);
    })
    let palettenr = savedPalette.length;
    const paletteObj = {palettename,colors,nr:palettenr}
    savedPalette.push(paletteObj);
    console.log(savedPalette);
    savetolocal(paletteObj);
    saveinput.value = "";
}


function savetolocal(paletteObj){
    let localpalettes;
    if(localStorage.getItem("palettes")=== null){
        localpalettes = [];
    }else{
        localpalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localpalettes.push(paletteObj);
    localStorage.setItem("palettes",JSON.stringify(localpalettes));

}

function openlibrary(){
    
}


randomColors();



