var out = [];

function newpoint() {

    let point = document.getElementsByName('x')[0].value + '/' + document.getElementsByName('y')[0].value + '/' + document.getElementsByName('z')[0].value;

    out.push(point);

    console.log(out)


    let outputfield = document.getElementsByName('output')[0]
    outputfield.innerHTML = '';
    for (let i = 0; i < out.length; i++) {
        outputfield.innerHTML += out[i] + '<br>';
    }

}
