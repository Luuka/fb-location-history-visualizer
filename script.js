document.addEventListener('DOMContentLoaded', function(){

  let markers = [];

  let map = L.map('map').setView([0,0], 8);
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OSM',
    maxZoom: 18
  }).addTo(map);

  document.getElementById('loadForm').addEventListener('submit', function(e){
    e.preventDefault();
    let file = document.getElementById('loadForm--input').files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
      let locationHistory = JSON.parse(reader.result);
      locationHistory.location_history.forEach(function(loc){
        console.log(loc);
        let title = loc.title;
        let time = new Date(loc.timestamp*1000);
        loc.attachments.forEach(function(attach){
          let location = attach.data[0];
          let coords = location.place.coordinate;
          let marker = L.marker([coords.latitude, coords.longitude]).addTo(map);

          let titleDecode = (title == undefined ? "" : title.decode());

          let popin = `
            <h3>`+titleDecode+`</h3>
            `+formatDate(time)+` <br>
            `+attach.data.length+` location` + (attach.data.length > 1 ? "s" : "") ;
          marker.bindPopup(popin);
          markers.push(marker);
        })
      });

      let markerFeatureGroup = L.featureGroup(markers).addTo(map);
      map.fitBounds(markerFeatureGroup.getBounds());


    };
    reader.readAsText(file);
  });
});

function formatDate(date) {
  var day = date.getDate();
  var monthIndex = parseInt(date.getMonth())+1;
  var year = date.getFullYear();

  let month = monthIndex < 10 ? "0"+monthIndex : monthIndex

  return day+"/"+month+"/"+year;
}

String.prototype.decode = function() {
    var result = "";

    var index = 0;
    var c = c1 = c2 = 0;

    while(index < this.length) {
        c = this.charCodeAt(index);

        if(c < 128) {
            result += String.fromCharCode(c);
            index++;
        }
        else if((c > 191) && (c < 224)) {
            c2 = this.charCodeAt(index + 1);
            result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            index += 2;
        }
        else {
            c2 = this.charCodeAt(index + 1);
            c3 = this.charCodeAt(index + 2);
            result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            index += 3;
        }
    }

    return result;
};
