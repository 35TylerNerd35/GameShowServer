window.onload = function(){

    const btn = document.getElementById("Test");

    btn.onclick = () => {
        option_name = "Option 1";
        option_id = 1;
        inner = buttonPreset;
        // document.getElementById("root").innerHTML += inner;
        const root = document.getElementById("root");
        root.insertAdjacentHTML('beforeend', inner);
        // document.getElementById(option_name + "Label").innerHTML = option_name + " (0)";
        for (const child of  document.getElementById("root").children) {
            console.log(child.id);
        }
    
    }
}