var input = document.getElementById("subjectInput");
input.addEventListener("keyup", function(event) 
{
    if (event.keyCode === 13 ) {
        event.preventDefault();
        AddSubjectToTable();
        // document.getElementById("addSubject").click();
    }
});

AddSubjectToTable.ectsSum = 0;
AddSubjectToTable.hoursSum = 0;

function AddSubjectToTable()
{
    var subjectName = document.getElementById("subjectInput").value;

    const thead = document.querySelector('thead');
    var isHeadEmpty = $("thead").html() === "";

    if (isHeadEmpty === true) {
        thead.innerHTML +=`
            <th>Kolegij</th>
            <th>ECTS</th>
            <th>Sati</th>
            <th>P</th>
            <th>V</th>
            <th>Tip</th>
            <th></th>`;
    }

    const tbody = document.querySelector('tbody');

    subjectsWithDetails.forEach(element => {
        if (subjectName == element.name) 
        {
            tbody.innerHTML +=`
            <tr>
                <td>${element.name}</td>
                <td>${element.ects}</td>
                <td>${element.hours}</td>
                <td>${element.lectures}</td>
                <td>${element.labs}</td>
                <td>${element.type}</td>
                <td><button class="removeSubject" onclick="RecalculateSums(${element.ects}, ${element.hours})">Obriši</button></td>
            </tr>
            `;

            AddSubjectToTable.ectsSum += element.ects;
            AddSubjectToTable.hoursSum += element.hours;
        }
    });

    const tfoot = document.querySelector('tfoot');
    var isFootEmpty = $("tfoot").html() === "";




    if (isFootEmpty === true) {
        tfoot.innerHTML +=`
            <th>Ukupno:</th>

            <th id="ectsSum">${AddSubjectToTable.ectsSum}</th>
            <th id="hoursSum">${AddSubjectToTable.hoursSum}</th>

            <th></th>
            <th></th>
            <th></th> 
            <th></th>
        `;
    }
    else
    {
        document.getElementById("ectsSum").innerHTML=AddSubjectToTable.ectsSum;
        document.getElementById("hoursSum").innerHTML=AddSubjectToTable.hoursSum;
    }
    document.getElementById("subjectInput").value="";
    
}



$(document).ready(function(){
    $('body').on('click', '.removeSubject', function(){
        $(this).parents('tr').remove();  
    });
});

function RecalculateSums(ects, hours)
{
    AddSubjectToTable.ectsSum -= ects;
    AddSubjectToTable.hoursSum -= hours;

    document.getElementById("ectsSum").innerHTML=AddSubjectToTable.ectsSum;
    document.getElementById("hoursSum").innerHTML=AddSubjectToTable.hoursSum;
}
