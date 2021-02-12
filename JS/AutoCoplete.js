function autocomplete(inp, arr) 
{
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) 
    {
        var div, div2, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        div = document.createElement("DIV");
        div.setAttribute("id", this.id + "autocomplete-list");
        div.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(div);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) 
        {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) 
            {
                /*create a DIV element for each matching element:*/
                div2 = document.createElement("DIV");
                /*make the matching letters bold:*/
                div2.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                div2.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                div2.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/

                div2.addEventListener("click", function(e) 
                {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values, or any other open lists of autocompleted values:*/
                    closeAllLists();
                });

                div.appendChild(div2);
            }
        }
    });

     /*execute a function presses a key on the keyboard:*/
     inp.addEventListener("keydown", function(listener) 
     {
         var focus = document.getElementById(this.id + "autocomplete-list");

         

         if (focus) focus = focus.getElementsByTagName("div");
         if (listener.keyCode == 40) 
         {
             /*If the arrow DOWN key is pressed,
             increase the currentFocus variable:*/
             currentFocus++;
             /*and and make the current item more visible:*/
             addActive(focus);
         } 
         else if (listener.keyCode == 38) 
         { //up
             /*If the arrow UP key is pressed,
             decrease the currentFocus variable:*/
             currentFocus--;
             /*and and make the current item more visible:*/
             addActive(focus);
         } 
         else if (listener.keyCode == 13) 
         {
             /*If the ENTER key is pressed, prevent the form from being submitted,*/
             listener.preventDefault();
             if (currentFocus > -1) 
             {
                 /*and simulate a click on the "active" item:*/
                 if (focus) focus[currentFocus].click();
             }
         }
         
     });

     function addActive(focus) 
     {
         /*a function to classify an item as "active":*/
         if (!focus) return false;
         /*start by removing the "active" class on all items:*/
         removeActive(focus);
         if (currentFocus >= focus.length) currentFocus = 0;
         if (currentFocus < 0) currentFocus = (focus.length - 1);
         /*add class "autocomplete-active":*/
         focus[currentFocus].classList.add("autocomplete-active");
     }

     function removeActive(focus) 
     {
         /*a function to remove the "active" class from all autocomplete items:*/
         for (var i = 0; i < focus.length; i++) 
         {
          focus[i].classList.remove("autocomplete-active");
         }
     }

     function closeAllLists(element) 
     {
         /*close all autocomplete lists in the document,
         except the one passed as an argument:*/
         var focus = document.getElementsByClassName("autocomplete-items");
         for (var i = 0; i < focus.length; i++) 
         {
             if (element != focus[i] && element != inp) 
             {
                 focus[i].parentNode.removeChild(focus[i]);
             }
         }       
     }

     /*execute a function when someone clicks in the document:*/
     document.addEventListener("click", function (listener) 
     {
         closeAllLists(listener.target);
     });

}