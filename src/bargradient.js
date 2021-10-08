const MAX_SPREAD = 25;

class Bargradient extends HTMLElement {

    #inputHandler = this.update.bind(this);

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(template());
    }

    connectedCallback() {
        let input = this.#$('#ui').children;
        for(let i = 0; i < input.length; i++) {
            input[i].addEventListener('click', this.#inputHandler);
            input[i].addEventListener('keyup', this.#inputHandler);
        }
        this.update();
    }

    #$(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    update() {
        let size = Number(this.#$('#size input').value);
        let spread = Number(this.#$('#spread input').value);
        let rotation = Number(this.#$('#rotation input').value);
        let blur = Number(this.#$('#blur input').value);
        let background = this.#$('#background input').value;
        let stripe = this.#$('#stripe input').value;

        // The ratio of the background sizing perfectly follows the tangent except at the limits.
        // Above 90deg, you need to reverse the tangent.
        let invert = rotation > (Math.PI / 2) ? -1 : 1;
        let multiplyer = Math.tan(rotation) * invert;
        if (!multiplyer || multiplyer < (Math.PI / 180) * 1) {
            // 1 degree is a reasonable limit.
            multiplyer = 1;
        }

        // Blur and spread adjustments.
        let b = MAX_SPREAD / 2 * blur;
        let s = Math.max(b, (MAX_SPREAD-b) * spread);
        let st = (MAX_SPREAD) - s;

        // The back
        let bgCss = `background: ${background}`;
        let stripeCss = `background-color: transparent;
  background-size: ${size}px ${Math.round(size * multiplyer)}px;
  background-image: linear-gradient(${rotation}rad,
    ${stripe} ${s-b}%,
    transparent ${25-st+b}%, transparent ${25+st-b}%,
    ${stripe} ${50-s+b}%, ${stripe} ${50+s-b}%,
    transparent ${75-st+b}%, transparent ${75+st-b}%,
    ${stripe} ${100-s+b}% );`;

        // Render
        let cssElm = this.#$('#css textarea');
        let cssStr = `
.bargradient {
  ${bgCss.replace('<>&','')}
  border-radius: 30px;
  box-shadow: 0px 5px 3px 0 rgba(0,0,0,0.5);
}

.bargradient::before {
  ${stripeCss.replace('<>&','')}
  background-clip: padding-box;
  border-radius: 30px;
  border: 3px solid rgba(0, 0, 0, 0.2);
  box-shadow: inset 0px 8px 3px -3px rgba(255,255,255, 0.9);
}`;
        cssElm.innerHTML = cssStr.replace(/<|>|&/g,'');

        let displayElm = this.#$('#display');
        displayElm.setAttribute('style', bgCss);
        let stripeElm = this.#$('#stripes');
        stripeElm.setAttribute('style', stripeCss);

        this.#$('#size span').innerText = size;
        this.#$('#spread span').innerText = spread;
        this.#$('#rotation span').innerText = rotation;
        this.#$('#blur span').innerText = blur;
    }
}

const template = (html => {
    let t = document.createElement('template');
    t.innerHTML = html;
    return () => {
        return t.content.cloneNode(true);
    };
})(`
<style>
:host {
    width: 100%;
    height: 100%;
}
:host * {
    box-sizing: border-box;
    margin: 0; padding: 0;
}
#ui {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}
#ui div {
    margin: 10px;
}
#ui label {
    display: block;
}
#ui input[type="text"] {
    width: 300px;
}
#output {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    height: 500px;
}
#css {
    flex: 1 0 auto;
    width: 50%; height: 100%;
    min-width: 300px;
}
#css textarea {
    width: 100%; height: 100%;
    white-space: pre-wrap;
    resize: none;
}
#display {
    flex: 1 0 auto;
    position: relative;
    width: 50%; height: 100%;
    background: red;
    border-radius: 30px;
    box-shadow: 0px 5px 3px 0 rgba(0,0,0,0.5);
}
#stripes {
    position: absolute;
    top: 0; left; 0;
    width: 100%; height: 100%;
    background-repeat: repeat;
    background-clip: padding-box;
    border-radius: 30px;
    border: 10px solid rgba(0,0,0,0.3);
    box-shadow: inset 0px 8px 3px -3px rgba(255,255,255, 0.9);
}
</style>

<div id="ui">
    <div id="size">
        <label for="size">size: <span>12</span></label>
        <input name="size" type="range" min="1" max="500" value="12">
    </div>
    <div id="blur">
        <label for="blur">blur: <span>0.2</span></label>
        <input name="blur" type="range" min="0" max="1" value="0.2" step="0.01">
    </div>
    <div id="spread">
        <label for="spread">spread: <span>1</span></label>
        <input name="spread" type="range" min="0.1" max="1" value=".5" step="0.01">
    </div>
    <div id="rotation">
        <label for="rotation">rotation: <span>2.3562</span></label>
        <input name="rotation" type="range" min="0" max="3.1416" value="2.3562" step="0.0175">
    </div>
    <div id="background">
        <label for="background">background fill</label>
        <input name="background" type="text" value="linear-gradient(#b40000,#200)">
    </div>
    <div id="stripe">
        <label for="stripe">stripe color</label>
        <input name="stripe" type="text" value="rgba(255,255,255,0.1)">
    </div>
</div>

<div id="output">
    <div id="css">
    <textarea></textarea>
    </div>
    <div id="display"><div id="stripes"></div></div>
</div>
`);


export default Bargradient;
customElements.define('gr-bargradient', Bargradient);