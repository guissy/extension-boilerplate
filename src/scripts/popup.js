import ext from "./utils/ext";
import storage from "./utils/storage";

var popup = document.getElementById("app");
storage.get('color', function(resp) {
  var color = resp.color;
  if(color) {
    popup.style.backgroundColor = color
  }
});

var template = (data) => {
  var json = JSON.stringify(data);
  return (`
  <div class="site-description">
    <p class="tops">总分：<span class="title">
<span style="color: ${data.scores>8?'#F00':'#808080'}">${data.scores.toFixed(1)}</span>
</span></p>
    <p>
      <table style="display: ${data.scores>0?'':'none'}">
        <thead>
        <tr> <th>关键字</th> <th>时长</th> <th>得分</th> </tr>
        </thead>
        <tbody>
        ${data.words.map(([a,b,c])=>'<tr><td>'+a+'</td><td>'+b+'</td><td>'+c+'</td></tr>').join('')}
        </tbody>
      </table>
      <p style="display: ${data.scores==0?'':'none'}">很遗憾，没匹配到关键字！</p>
    </p>
    <small>${data.article}</small>
  </div>
  <div class="action-container">
    <!--<button data-bookmark='${json}' id="save-btn" class="btn btn-primary">Save</button>-->
  </div>
  `);
}
var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
}

var renderBookmark = (data) => {
  var displayContainer = document.getElementById("display-container")
  if(data) {
    var tmpl = template(data);
    displayContainer.innerHTML = tmpl;  
  } else {
    renderMessage("Ooops, 需要重新刷新此页面！")
  }
}

ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderBookmark);
});

popup.addEventListener("click", function(e) {
  if(e.target && e.target.matches("#save-btn")) {
    e.preventDefault();
    var data = e.target.getAttribute("data-bookmark");
    ext.runtime.sendMessage({ action: "perform-save", data: data }, function(response) {
      if(response && response.action === "saved") {
        renderMessage("Your bookmark was saved successfully!");
      } else {
        renderMessage("Sorry, there was an error while saving your bookmark.");
      }
    })
  }
});

var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
})
