export const names = ["cube", "bunny", "cow", "chicken", "rat", "newscene"];

export function get(name) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "assets/"+name+".obj");
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) resolve({
                    name: name,
                    data: this.responseText
                });
                else reject("Error to load " + name + ".");
            }
        };
        xhr.send();
    });
}

export var assets = [];



function call(name) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "assets/"+name+".obj");
        xhr.onreadystatechange= function() {
            if (this.readyState == 4) {
                if (this.status == 200) resolve({
                    name: name,
                    data: this.responseText
                });
                else reject("Error to load " + name);
            }
        };
        xhr.send();
    });
}


Promise.all(names.map((name) => call(name))).then((results) => {
    assets = results;

}).catch((reason) => {
    console.log(reason);
})
