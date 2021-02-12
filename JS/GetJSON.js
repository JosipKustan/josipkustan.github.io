$.getJSON('http://www.fulek.com/VUA/SUPIT/GetNastavniPlan', function(data) 
    {
        LoadNames(data);
        LoadSubjects(data);
        LoadSubjectDetails(data);
    });

    var subjectNames = [];
    var subjects = [];
    var subjectsWithDetails = [];
    
    class Subject 
    {
        constructor(name, id) {
            this.name = name;
            this.id = id;
        }
    }
    
    class SubjectWithDetails
    {
        constructor(id, name, ects, hours, lectures, labs, type, semester) {
            this.id = id;
            this.name = name;
            this.ects = ects;
            this.hours = hours;
            this.lectures = lectures;
            this.labs = labs;
            this.type = type;
            this.semester = semester;
        }
    }

    function LoadNames(data)
    {
        data.forEach(element => {
            subjectNames.push(element.label);
        });
    }


    function LoadSubjects(data)
    {
        data.forEach(element => {
            var subject = new Subject(element.label, element.value);
            subjects.push(subject);
        });
    }

    


    function LoadSubjectDetails(data)
    {
        subjects.forEach(element => {
            var url = 'http://www.fulek.com/VUA/supit/GetKolegij/' + element.id;
            $.getJSON(url, function(detail) 
            {
                var subject = new SubjectWithDetails(detail.id, detail.kolegij, detail.ects, detail.sati, detail.predavanja, detail.vjezbe, detail.tip, detail.semestar);

                subjectsWithDetails.push(subject);
            });
        });
    }
    
    /*initiate the autocomplete function on the "myInput" element, and pass along the subjects array as possible autocomplete values:*/
    autocomplete(document.getElementById("subjectInput"), subjectNames);