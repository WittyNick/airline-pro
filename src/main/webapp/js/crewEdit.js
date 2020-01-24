let doc = document;
let tmpSelectedCrewRow = null;
let tmpSelectedBaseRow = null;

window.onload = function() {
    localizeCrewEdit();
    doc.getElementById("lang").addEventListener("change", function() {
        let body = "locale=" + document.getElementById("lang").value;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "locale/change", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                if ("ok" === xhr.responseText) {
                    localizeCrewEdit();
                }
            }
        };
        xhr.send(body);
    });
    addEmployeeListSelect();
    addEmployeeBaseSelect();
};

function addEmployeeListSelect() {
    let employeeListRows = doc.getElementById("employeeListBody").children;
    for (let i = 0; i < employeeListRows.length; i++) {
        employeeListRows[i].addEventListener("click", onEmployeeListRowClick);
    }
}

function onEmployeeListRowClick() {
    if (tmpSelectedCrewRow != null) {
        tmpSelectedCrewRow.classList.remove("selected");
    }
    this.classList.add("selected");
    tmpSelectedCrewRow = this;
}

function addEmployeeBaseSelect() {
    let employeeBaseRows = doc.getElementById("employeeBaseBody").children;
    for (let j = 0; j < employeeBaseRows.length; j++) {
        employeeBaseRows[j].addEventListener("click", onEmployeeBaseRowClick);
    }
}

function onEmployeeBaseRowClick() {
    if (tmpSelectedBaseRow != null) {
        tmpSelectedBaseRow.classList.remove("selected");
    }
    this.classList.add("selected");
    tmpSelectedBaseRow = this;
}

function removeFromCrewAction() {
    if (tmpSelectedCrewRow == null) {
        return;
    }
    if (tmpSelectedBaseRow != null) {
        tmpSelectedBaseRow.classList.remove("selected");
    }
    let tableEmployeeBaseBody = doc.getElementById("employeeBaseBody");
    let tableEmployeeListBody = doc.getElementById("employeeListBody");
    tmpSelectedCrewRow.removeEventListener("click", onEmployeeListRowClick);
    tableEmployeeListBody.removeChild(tmpSelectedCrewRow);
    tableEmployeeBaseBody.appendChild(tmpSelectedCrewRow);
    tmpSelectedCrewRow.addEventListener("click", onEmployeeBaseRowClick);
    tmpSelectedBaseRow = tmpSelectedCrewRow;
    tmpSelectedCrewRow = null;
}

function addToCrewAction() {
    if (tmpSelectedBaseRow == null) {
        return;
    }

    if (tmpSelectedCrewRow != null) {
        tmpSelectedCrewRow.classList.remove("selected");
    }
    let tableEmployeeBaseBody = doc.getElementById("employeeBaseBody");
    let tableEmployeeListBody = doc.getElementById("employeeListBody");
    tmpSelectedBaseRow.removeEventListener("click", onEmployeeBaseRowClick);
    tableEmployeeBaseBody.removeChild(tmpSelectedBaseRow);
    tableEmployeeListBody.appendChild(tmpSelectedBaseRow);
    tmpSelectedBaseRow.addEventListener("click", onEmployeeListRowClick);
    tmpSelectedCrewRow = tmpSelectedBaseRow;
    tmpSelectedBaseRow = null;
}

function engageEmployeeAction() {
    if (!isValidAddEmployee()) {
        return;
    }
    let inputNewEmployeeName = doc.getElementById("newEmployeeName");
    let inputNewEmployeeSurname = doc.getElementById("newEmployeeSurname");
    let employeeSend = {
        "id": 0,
        "name": inputNewEmployeeName.value,
        "surname": inputNewEmployeeSurname.value,
        "position": doc.getElementById("newEmployeePosition").value
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "employee/add", true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let employeeResponse = JSON.parse(xhr.responseText);
            let row = doc.createElement("TR");
            let tdId = doc.createElement("TD");
            let tdName = doc.createElement("TD");
            let tdSurname = doc.createElement("TD");
            let tdPositionEnum = doc.createElement("TD");
            let tdPosition = doc.createElement("TD");
            row.appendChild(tdId);
            row.appendChild(tdName);
            row.appendChild(tdSurname);
            row.appendChild(tdPositionEnum);
            row.appendChild(tdPosition);
            tdId.innerText = employeeResponse["id"];
            tdName.innerText = employeeResponse["name"];
            tdSurname.innerText = employeeResponse["surname"];
            tdPositionEnum.innerText = employeeResponse["position"];
            tdPosition.innerText = responseObject[employeeResponse["position"].toLowerCase()]; // localization
            row.addEventListener("click", onEmployeeListRowClick);
            doc.getElementById("employeeListBody").appendChild(row);
            row.click();
            inputNewEmployeeName.value = "";
            inputNewEmployeeSurname.value = "";
        }
    };
    xhr.send(JSON.stringify(employeeSend));
}

function fireEmployeeAction() {
    if (tmpSelectedBaseRow == null) {
        return;
    }
    if (!confirm(responseObject["crew.edit.confirm.fire_employee"])) {
        return;
    }
    let employeeChildren = tmpSelectedBaseRow.children;
    let employee = {
        "id": employeeChildren[0].innerText,
        "name": employeeChildren[1].innerText,
        "surname": employeeChildren[2].innerText,
        "position": employeeChildren[3].innerText
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "employee/delete", true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            if ("ok" === xhr.responseText) {
                let employeeBaseBody = doc.getElementById("employeeBaseBody");
                employeeBaseBody.removeChild(tmpSelectedBaseRow);
                tmpSelectedBaseRow = null;
            }
        }
    };
    xhr.send(JSON.stringify(employee));
}

function saveAction() {
    if (!isValidSave()) {
        return;
    }
    let bobtailFlight = {
        "id": doc.getElementById("flightId").value,
        "crew": {
            "id": doc.getElementById("crewId").value,
            "name": doc.getElementById("name").value,
            "employees": []
        }
    };
    let employeeListBodyRows = doc.getElementById("employeeListBody").children;
    for (let i = 0; i < employeeListBodyRows.length; i++) {
        let employeeFields = employeeListBodyRows[i].children;
        let employee = {
            "id": employeeFields[0].innerText,
            "name": employeeFields[1].innerText,
            "surname": employeeFields[2].innerText,
            "position": employeeFields[3].innerText
        };
        bobtailFlight["crew"]["employees"].push(employee);
    }
    console.log(JSON.stringify(bobtailFlight));
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "save", true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            if ("ok" === xhr.responseText) {
                doc.location.href = "../dispatcher";
            }
        }
    };
    xhr.send(JSON.stringify(bobtailFlight));
}

function signOut() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../signout", true);
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            doc.location.href = "../";
        }
    };
    xhr.send();
}

let messageCrewNameIndex = 0;
let messageNewEmployeeIndex = 0;

function isValidSave() {
    let valid = true;
    let inputName = doc.getElementById("name");
    if (!inputName.value.trim()) {
        messageCrewNameIndex = 1;
        valid = false;
    } else {
        messageCrewNameIndex = 0;
    }
    setMessages();
    return valid;
}

function isValidAddEmployee() {
    let valid = true;
    let inputNewEmployeeName = doc.getElementById("newEmployeeName");
    let inputNewEmployeeSurname = doc.getElementById("newEmployeeSurname");
    if (!inputNewEmployeeName.value.trim() && !inputNewEmployeeSurname.value.trim()) {
        messageNewEmployeeIndex = 4;
        valid = false;
    } else {
        if (!inputNewEmployeeName.value.trim()) {
            messageNewEmployeeIndex = 2;
            valid = false;
        } else if (!inputNewEmployeeSurname.value.trim()) {
            messageNewEmployeeIndex = 3;
            valid = false;
        } else {
            messageNewEmployeeIndex = 0;
        }
    }
    doc.getElementById("messageNewEmployee").innerText = messages[messageNewEmployeeIndex];
    setTimeout(function() {
        messageNewEmployeeIndex = 0;
        doc.getElementById("messageNewEmployee").innerText = messages[messageNewEmployeeIndex];
    }, 2000);
    return valid;
}

function setMessages() {
    doc.getElementById("messageName").innerText = messages[messageCrewNameIndex];
}