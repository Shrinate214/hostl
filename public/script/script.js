function btnToLink(event) {
    event.preventDefault();
    document.getElementById("complaint-ren").submit();
}
function btnToLink2(event) {
    event.preventDefault();
    document.getElementById("AllocationSetUp").submit();
}
function btnToLink3(event) {
    event.preventDefault();
    document.getElementById("roomstatus").submit();
}
function btnToLink4(event) {
    event.preventDefault();
    document.getElementById("comp").submit();
}

function previous() {
    window.history.back();
}

function searching() {

    document.querySelectorAll(".tr").forEach(element => {
        element.remove()
    });

    var name = document.getElementById("name").value;
    var sid = document.getElementById('sid').value;

    var table = document.getElementsByTagName("table")[0];

    var req = new XMLHttpRequest();


    req.open("GET", "/searching?name=" + name + "&sid=" + sid);
    req.send();


    if (name.length != 0 || sid != 0) {
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                var obj = JSON.parse(req.responseText)
                console.log(obj);
                if (obj.length > 0) {
                    for (let index = 0; index < obj.length; index++) {
                        table.innerHTML += "<tr class='tr'><td>" + obj[index]["name"] + "</td><td>" + obj[index]["email_id"] + "</td><td>" + obj[index]["SID"] + "</td><td>" + obj[index]["batch"] + "</td><td>" + obj[index]["Room_assigned"] + "</td></tr>";
                    }
                }
            }
        }
    }


    return false;
}


function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    w=window.open();
    w.document.write(printContents);
    w.print();
    w.close();
}