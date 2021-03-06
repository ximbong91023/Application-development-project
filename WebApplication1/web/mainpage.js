document.addEventListener("DOMContentLoaded", function(event) {
  function xmlToJson(xml) {
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) {
      // element
      // do attributes
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) {
      // text
      obj = xml.nodeValue;
    }

    // do children
    // If just one text node inside
    if (
      xml.hasChildNodes() &&
      xml.childNodes.length === 1 &&
      xml.childNodes[0].nodeType === 3
    ) {
      obj = xml.childNodes[0].nodeValue;
    } else if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof obj[nodeName] == "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  }

  // var key =
  //   "http://sandbox.api.simsimi.com/request.p?key=ebf0dfaf-719b-440c-9b30-4d7ead297e2e&lc=en&ft=1.0&text=";
  var username = JSON.parse(localStorage.user).username;
  var status = parseInt(JSON.parse(localStorage.user).statusCode);

  //display status when login
  switch (status) {
    case 1:
      document.getElementById("nav-status").classList.add("color-online");
      break;
    case 2:
      document.getElementById("nav-status").classList.add("color-idle");
      break;
    case 3:
      document.getElementById("nav-status").classList.add("color-busy");
      break;
    default:
      document.getElementById("nav-status").classList.add("color-invisible");
  }
  //display the username when login
  document.getElementById("nav-username").textContent = username;

  //empty the user-chat-column innerHTML
  let list = document.querySelector(".user-chat-column");
  let url = `http://10.114.32.77:8080/WebApplication1/ws/users`;
  list.innerHTML = "";

  //make fetch call which will receive info under XML file
  fetch(url, {
    method: "GET"
  })
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => xmlToJson(data))
    .then(function(response) {
      for (let element of response.userss.users) {
        let { id, departmentId, statusCode, username } = element;

        /* basically display this

        <div class="user-box">
          <div class="avatar"></div>
          <div class="chat-info">
            <div class="id"> <span class="username">ximbong91023</span> <i class="fa fa-circle status color-online" aria-hidden="true"></i></div>
            <div class="timestamp">17:30</div>
            <div class="last-msg">hello</div>
          </div>
        </div>

        */

        let boxDiv = document.createElement("div");
        let avatarDiv = document.createElement("div");
        let chatInfoDiv = document.createElement("div");
        let idDiv = document.createElement("div");
        let timestampDiv = document.createElement("div");
        let lastmsgDiv = document.createElement("div");
        let usernameSpan = document.createElement("span");
        let icon = document.createElement("i");

        let classlist = ["fa", "fa-circle", "status"];
        icon.classList.add(...classlist);
        boxDiv.classList.add("user-box");
        avatarDiv.classList.add("avatar");
        chatInfoDiv.classList.add("chat-info");
        idDiv.classList.add("id");
        usernameSpan.classList.add("username");

        switch (parseInt(statusCode)) {
          case 1:
            icon.classList.add("color-online");
            break;
          case 2:
            icon.classList.add("color-idle");
            break;
          case 3:
            icon.classList.add("color-busy");
            break;
          default:
            icon.classList.add("color-invisible");
        }

        let textnode2 = document.createTextNode(username);
        usernameSpan.appendChild(textnode2);
        idDiv.appendChild(usernameSpan);
        idDiv.appendChild(icon);
        chatInfoDiv.appendChild(idDiv);
        chatInfoDiv.appendChild(timestampDiv);
        chatInfoDiv.appendChild(lastmsgDiv);
        boxDiv.appendChild(avatarDiv);
        boxDiv.appendChild(chatInfoDiv);

        // add event listener for elements that just have been created

        boxDiv.addEventListener("click", function() {
          document.querySelector(".user-info-area").innerHTML = "";

          /*basically will display this

            <div class="user-info-area">

               <div>Name: <span >1</span></div>
                <div>Online status: <span>2</span></div>
                <div>Department: <span >3</span></div>
                <div>Phone number: <span>4</span></div>

            </div>

            */

          let outerDiv = document.querySelector(".user-info-area");
          let textnode1 = document.createTextNode(id);
          let textnode2 = document.createTextNode(username);
          let textnode3 = document.createTextNode(departmentId.name);
          let textnode4 = document.createTextNode(statusCode);

          let div1 = document.createElement("div");
          let div2 = document.createElement("div");
          let div3 = document.createElement("div");
          let div4 = document.createElement("div");

          let text1 = document.createTextNode("ID: ");
          let text2 = document.createTextNode("Username: ");
          let text3 = document.createTextNode("Department: ");
          let text4 = document.createTextNode("Status Code: ");

          div1.appendChild(text1);
          div1.appendChild(textnode1);
          div2.appendChild(text2);
          div2.appendChild(textnode2);
          div3.appendChild(text3);
          div3.appendChild(textnode3);
          div4.appendChild(text4);
          div4.appendChild(textnode4);
          outerDiv.appendChild(div1);
          outerDiv.appendChild(div2);
          outerDiv.appendChild(div3);
          outerDiv.appendChild(div4);
        });

        //add new item into the user-chat-column declare earlier

        list.insertBefore(boxDiv, list.childNodes[0]);
      }
    });

  //message socket

  var socket = new WebSocket("ws://10.114.32.77:8080/WebApplication1/actions");
  socket.onmessage = onMessage;

  function onMessage(event) {
    var mess = JSON.parse(event.data);

    //compare to check if the user is the sender, then display if it's wrong, because the sender's won't be displayed this way

    if (parseInt(JSON.parse(localStorage.user).id) !== mess.senderId) {
      //basically will display this

      /*
      <div class="message-div msg-receive">
        <div class="chat-message float-right">Hello ximbong91023</div>
      </div>
      */

      let val = mess.content;
      let textnode = document.createTextNode(val);
      let innerDiv = document.createElement("div");
      let outerDiv = document.createElement("div");
      let classlist = [
        "message-div",
        "animated",
        "slideInLeft",
        "new-msg",
        "msg-receive"
      ];
      innerDiv.classList.add("chat-message");
      outerDiv.classList.add(...classlist);
      innerDiv.appendChild(textnode);
      outerDiv.appendChild(innerDiv);
      document.querySelector(".message-box").appendChild(outerDiv);

      //scroll to the bottom if the div if new there's a new message
      var objDiv = document.getElementById("chat-box");
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }

  //responsive setting

  document.getElementById("menu-icon").onclick = function() {
    let displayValue = document.getElementById("tabs").style.display;
    if (displayValue !== "flex") {
      //set backdrop to block if tabs aren't displayed as flex
      document.getElementById("backdrop").style.display = "block";
      //and set display of tabs to flex
      document.getElementById("tabs").style.display = "flex";
    }
  };

  //onclick behaviour of 2 dropdowns
  window.onclick = function(event) {
    if (document.getElementById("dropdown").contains(event.target))
      document.getElementById("dropdown-content").style.display = "block";
    else document.getElementById("dropdown-content").style.display = "none";

    if (document.getElementById("status-dropdown").contains(event.target))
      document.getElementById("status-dropdown-content").style.display =
        "block";
    else
      document.getElementById("status-dropdown-content").style.display = "none";

    if (document.getElementById("tabs").style.display === "flex") {
      if (document.getElementById("backdrop").contains(event.target)) {
        document.getElementById("tabs").style.display = "none";
        document.getElementById("backdrop").style.display = "none";
      }
    }
  };

  //button push behaviour

  var lastButtonPushed = document.getElementById("section1");
  var section = document.getElementsByClassName("section");

  //modify css if one of the 3 section buttons is clicked
  for (var i = 0; i < section.length; i++) {
    // Here we have the same onclick

    section[i].addEventListener("click", function(event) {
      var thisButtonPushed = event.target;
      console.log(lastButtonPushed);
      if (lastButtonPushed !== thisButtonPushed) {
        lastButtonPushed.classList.toggle("pushed");
        thisButtonPushed.classList.toggle("pushed");
        lastButtonPushed.classList.toggle("unpushed");
        thisButtonPushed.classList.toggle("unpushed");
        lastButtonPushed = thisButtonPushed;
      }
    });
  }

  //behaviour if section 1 is clicked

  document.getElementById("section1").addEventListener("click", function() {
    //basically display user-chat-column and user-info-area, hide others fields
    document.querySelector(".user-chat-column").style.display = "block";
    document.querySelector(".user-info-area").style.display = "block";
    document.querySelector(".group-chat-column").style.display = "none";
    document.querySelector(".ann-column").style.display = "none";
    document.querySelector(".input-box").style.display = "none";
    document.querySelector(".message-box").style.display = "none";

    //if screen width <1000, modify the dislayer
    if (window.innerWidth < 1000) {
      document
        .querySelector(".id-displayer")
        .classList.remove("id-displayer-group");
    }

    let url = `http://10.114.32.77:8080/WebApplication1/ws/users`;
    let list = document.querySelector(".user-chat-column");
    list.innerHTML = "";

    //fetch user list if the section 1 button is clicked
    fetch(url, {
      method: "GET"
    })
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => xmlToJson(data))
      .then(function(response) {
        for (let element of response.userss.users) {
          console.log(element);
          let { id, password, role, statusCode, username } = element;

          /* This part is redundant to the code on line 88-190
          <div class="user-box">
            <div class="avatar"></div>
            <div class="chat-info">
              <div class="id"> <span class="username">ximbong91023</span> <i class="fa fa-circle status color-online" aria-hidden="true"></i></div>
              <div class="timestamp">17:30</div>
              <div class="last-msg">hello</div>
            </div>
          </div>
          */

          let boxDiv = document.createElement("div");
          let avatarDiv = document.createElement("div");
          let chatInfoDiv = document.createElement("div");
          let idDiv = document.createElement("div");
          let timestampDiv = document.createElement("div");
          let lastmsgDiv = document.createElement("div");
          let usernameSpan = document.createElement("span");
          let icon = document.createElement("i");

          let classlist = ["fa", "fa-circle", "status"];
          icon.classList.add(...classlist);
          boxDiv.classList.add("user-box");
          avatarDiv.classList.add("avatar");
          chatInfoDiv.classList.add("chat-info");
          idDiv.classList.add("id");
          usernameSpan.classList.add("username");

          switch (parseInt(statusCode)) {
            case 1:
              icon.classList.add("color-online");
              break;
            case 2:
              icon.classList.add("color-idle");
              break;
            case 3:
              icon.classList.add("color-busy");
              break;
            default:
              icon.classList.add("color-invisible");
          }

          let textnode2 = document.createTextNode(username);
          usernameSpan.appendChild(textnode2);
          idDiv.appendChild(usernameSpan);
          idDiv.appendChild(icon);
          chatInfoDiv.appendChild(idDiv);
          chatInfoDiv.appendChild(timestampDiv);
          chatInfoDiv.appendChild(lastmsgDiv);
          boxDiv.appendChild(avatarDiv);
          boxDiv.appendChild(chatInfoDiv);

          list.appendChild(boxDiv);
        }

        for (let val of document.getElementsByClassName("user-box")) {
          val.addEventListener("click", function() {
            document.querySelector(".user-info-area").innerHTML = "";
            let element = val.getElementsByTagName("span");
            let usrname = element[0].textContent;

            // id,username,department, status code of the clicked user

            let id2, usn, dpm, stt;
            document.querySelector(".id-displayer").textContent = usrname;
            console.log(usrname);
            document.querySelector(".status-displayer").style.display = "block";
            document.querySelector(".ann-info").style.display = "none";

            //animation on mobile
            if (window.innerWidth < 1000) {
              document.querySelector(".main").style.transform =
                " translateX(-100%)";
              document.querySelector(".section-div").style.display = "none";
            }

            for (let element of response.userss.users) {
              if (element.username === usrname) {
                id2 = element.id;
                usn = element.username;
                dpm = element.departmentId.name;
                stt = element.statusCode;
              }
            }

            //display the user info

            let outerDiv = document.querySelector(".user-info-area");
            let textnode1 = document.createTextNode(id2);
            let textnode2 = document.createTextNode(usn);
            let textnode3 = document.createTextNode(dpm);
            let textnode4 = document.createTextNode(stt);
            let div1 = document.createElement("div");
            let div2 = document.createElement("div");
            let div3 = document.createElement("div");
            let div4 = document.createElement("div");
            let text1 = document.createTextNode("ID: ");
            let text2 = document.createTextNode("Username: ");
            let text3 = document.createTextNode("Department: ");
            let text4 = document.createTextNode("Status Code: ");
            div1.appendChild(text1);
            div1.appendChild(textnode1);
            div2.appendChild(text2);
            div2.appendChild(textnode2);
            div3.appendChild(text3);
            div3.appendChild(textnode3);
            div4.appendChild(text4);
            div4.appendChild(textnode4);
            outerDiv.appendChild(div1);
            outerDiv.appendChild(div2);
            outerDiv.appendChild(div3);
            outerDiv.appendChild(div4);
          });
        }
      });
  });

  //behaviour if section 2 is clicked
  document.getElementById("section2").addEventListener("click", function() {
    //display group-chat-column, chat-box (chat msg area), and chat inputbox
    document.querySelector(".user-chat-column").style.display = "none";
    document.querySelector(".ann-column").style.display = "none";
    document.querySelector(".user-info-area").style.display = "none";
    document.querySelector(".group-chat-column").style.display = "block";
    document.querySelector(".chat-box").style.display = "block";
    document.querySelector(".input-box").style.display = "flex";

    //mobile css change to fit the width
    if (window.innerWidth < 1000) {
      document
        .querySelector(".id-displayer")
        .classList.add("id-displayer-group");
    }

    //get call to get the department list
    let url = `http://10.114.32.77:8080/WebApplication1/ws/dpm`;
    let list = document.querySelector(".group-chat-column");
    list.innerHTML = "";
    fetch(url, {
      method: "GET"
    })
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => xmlToJson(data))
      .then(function(response) {
        for (let element of response.departments.department) {
          //check if the user belongs to the group admin, which can see every groups

          if (JSON.parse(localStorage.user).departmentId.name === "Admin") {
            let { id, name } = element;

            /*
            <div class="group-box">
              <div class="chat-info">
                <div class="id"> <span class="groupname">Group name here</span> </div>
                <div class="timestamp">17:30</div>
                <div class="last-msg">hello</div>
              </div>
            </div>
            */

            let boxDiv = document.createElement("div");
            let chatInfoDiv = document.createElement("div");
            let idDiv = document.createElement("div");
            let timestampDiv = document.createElement("div");
            let lastmsgDiv = document.createElement("div");
            let usernameSpan = document.createElement("span");

            boxDiv.classList.add("group-box");
            chatInfoDiv.classList.add("chat-info");
            idDiv.classList.add("id");
            usernameSpan.classList.add("groupname");

            let textnode2 = document.createTextNode(name);
            usernameSpan.appendChild(textnode2);
            idDiv.appendChild(usernameSpan);
            chatInfoDiv.appendChild(idDiv);
            chatInfoDiv.appendChild(timestampDiv);
            chatInfoDiv.appendChild(lastmsgDiv);
            boxDiv.appendChild(chatInfoDiv);

            list.insertBefore(boxDiv, list.childNodes[0]);
          } else {
            let { id, name } = element;

            //normal users can only see their groups

            if (JSON.parse(localStorage.user).departmentId.name === name) {
              let boxDiv = document.createElement("div");
              let chatInfoDiv = document.createElement("div");
              let idDiv = document.createElement("div");
              let timestampDiv = document.createElement("div");
              let lastmsgDiv = document.createElement("div");
              let usernameSpan = document.createElement("span");

              boxDiv.classList.add("group-box");
              chatInfoDiv.classList.add("chat-info");
              idDiv.classList.add("id");
              usernameSpan.classList.add("groupname");

              let textnode2 = document.createTextNode(name);
              usernameSpan.appendChild(textnode2);
              idDiv.appendChild(usernameSpan);
              chatInfoDiv.appendChild(idDiv);
              chatInfoDiv.appendChild(timestampDiv);
              chatInfoDiv.appendChild(lastmsgDiv);
              boxDiv.appendChild(chatInfoDiv);

              list.insertBefore(boxDiv, list.childNodes[0]);
            }
          }
        }

        //group-box onclick listener
        for (let val of document.getElementsByClassName("group-box")) {
          val.addEventListener("click", function() {
            //empty  the message box
            document.querySelector(".message-box").innerHTML = "";
            let element = val.getElementsByTagName("span");
            //get the group name displayed through the span earlier
            let groupname = element[0].textContent;
            let id;

            //display the group name in the displayer div
            document.querySelector(".id-displayer").textContent = groupname;

            document.querySelector(".status-displayer").style.display = "none";
            document.querySelector(".ann-info").style.display = "none";
            document.querySelector(".message-box").style.display = "block";

            if (window.innerWidth < 1000) {
              document.querySelector(".main").style.transform =
                " translateX(-100%)";
              document.querySelector(".section-div").style.display = "none";
            }

            //get id of the department for the fetch call later
            for (let element of response.departments.department) {
              if (element.name === groupname) id = element.id;
            }

            //fetch call to get the messages in the department
            let url = `http://10.114.32.77:8080/WebApplication1/ws/msg?id=${id}`;
            fetch(url, {
              method: "GET"
            })
              .then(response => response.text())
              .then(str =>
                new window.DOMParser().parseFromString(str, "text/xml")
              )
              .then(data => xmlToJson(data))
              .then(function(response) {
                for (let element of response.messages.message) {
                  console.log(element);

                  //destructure the array to get the needed values to display the message later

                  let {
                    id,
                    content,
                    isTask,
                    status,
                    details,
                    place,
                    description,
                    sendtime
                  } = element;

                  let senderId = element.senderId.id;

                  //check if the that message is a task message or not (there are 2 types of msg: text msg and task msg)

                  //display text msg
                  if (isTask === "false") {
                    let senderId = element.senderId.id;
                    let val = content;
                    let textnode = document.createTextNode(val);
                    let classlist;
                    let innerDiv = document.createElement("div");
                    let outerDiv = document.createElement("div");
                    if (senderId === JSON.parse(localStorage.user).id) {
                      classlist = ["message-div", "new-msg", "msg-send"];
                    } else {
                      classlist = ["message-div", "new-msg", "msg-receive"];
                    }

                    innerDiv.classList.add("chat-message");
                    outerDiv.classList.add(...classlist);
                    innerDiv.appendChild(textnode);
                    outerDiv.appendChild(innerDiv);
                    document
                      .querySelector(".message-box")
                      .appendChild(outerDiv);

                    var objDiv = document.getElementById("chat-box");
                    objDiv.scrollTop = objDiv.scrollHeight;
                  }

                  //display task msg
                  if (isTask === "true") {
                    /*
                    <div class="task-div msg-receive">
                      <div class="chat-message float-left">
                        <p><span class="task-span">Task Name: </span><span class="task-span1">first line</span></p>
                        <p><span class="task-span">location: </span><span class="task-span2"> Main Lobby</span> </p>
                        <p><span class="task-span">time: </span><span class="task-span3"> 1.1.2019 15:00</span> <br> <br></p>
                        <p> <span class="task-span">details: </span><span class="task-span4"> detailed explanation.</span></p>
                        <div class = "task-box">
                          <div class="task-icon-receive"><i class="fas fa-check chat-icon1"></i></div>
                          <div class="task-icon-receive"><i class="fas fa-times chat-icon2"></i></div>
                        </div>
                      </div>
                    */
                    let textnode0 = document.createTextNode(
                      "You've sent this task"
                    );
                    let textnode1 = document.createTextNode(description);
                    let textnode2 = document.createTextNode(place);
                    let textnode3 = document.createTextNode(details);
                    let textnode4 = document.createTextNode(sendtime);
                    let div0 = document.createElement("div");
                    let div1 = document.createElement("div");
                    let div2 = document.createElement("div");
                    let div3 = document.createElement("div");
                    let div4 = document.createElement("div");
                    let innerDiv = document.createElement("div");
                    let outerDiv = document.createElement("div");
                    let buttonDiv = document.createElement("div");
                    let text1 = document.createTextNode("Task Name: ");
                    let text2 = document.createTextNode("Location: ");
                    let text3 = document.createTextNode("Details: ");
                    let text4 = document.createTextNode("Time: ");

                    //check if the user is the sender

                    if (senderId === JSON.parse(localStorage.user).id) {
                      outerDiv.classList.add("task-div", "msg-send");
                      div0.appendChild(textnode0);
                      innerDiv.appendChild(div0);
                    } else {
                      outerDiv.classList.add("task-div", "msg-receive");
                    }
                    div1.style.marginTop = "10px";
                    div1.appendChild(text1);
                    div1.appendChild(textnode1);
                    div2.appendChild(text2);
                    div2.appendChild(textnode2);
                    div3.appendChild(text3);
                    div3.appendChild(textnode3);
                    div4.appendChild(text4);
                    div4.appendChild(textnode4);
                    innerDiv.classList.add("chat-message");

                    innerDiv.appendChild(div1);
                    innerDiv.appendChild(div2);
                    innerDiv.appendChild(div3);
                    innerDiv.appendChild(div4);

                    if (senderId !== JSON.parse(localStorage.user).id) {
                      //if the user is not the sender, check if the task has been done
                      if (status === "0") {
                        let e1 = document.createElement("i");
                        let e2 = document.createElement("i");
                        let d1 = document.createElement("div");
                        let d2 = document.createElement("div");
                        let d3 = document.createElement("div");
                        e1.classList.add("fas", "fa-check", "chat-icon1");
                        e2.classList.add("fas", "fa-times", "chat-icon2");
                        d1.classList.add("task-icon-receive");
                        d2.classList.add("task-icon-receive");
                        d3.classList.add("task-box");
                        d1.appendChild(e1);
                        d2.appendChild(e2);
                        d3.appendChild(d1);
                        d3.appendChild(d2);
                        innerDiv.appendChild(d3);

                        d1.addEventListener("click", function() {
                          let putURL = `http://10.114.32.77:8080/WebApplication1/ws/msg?mid=${id}&uid=${
                            JSON.parse(localStorage.user).id
                          }`;

                          fetch(putURL, {
                            method: "PUT"
                          });
                          d3.innerHTML = "You accepted this task";
                        });

                        d2.addEventListener("click", function() {
                          d3.innerHTML = "You temporarily declined this task";
                        });
                      } else {
                        let d1 = document.createElement("div");
                        d1.classList.add("task-box");
                        let t1;

                        //check if the task is done by this user

                        if (status !== JSON.parse(localStorage.user).id) {
                          t1 = document.createTextNode(
                            `User with ID ${status} has taken the task.`
                          );
                        } else {
                          t1 = document.createTextNode(
                            `You has taken the task.`
                          );
                        }

                        d1.appendChild(t1);
                        innerDiv.appendChild(d1);
                      }
                    } else {
                      if (status !== "0") {
                        let d1 = document.createElement("div");
                        d1.classList.add("task-box");
                        let t1 = document.createTextNode(
                          `User with ID ${status} has taken the task. `
                        );
                        d1.appendChild(t1);
                        innerDiv.appendChild(d1);
                      } else {
                        let d1 = document.createElement("div");
                        d1.classList.add("task-box");
                        let t1 = document.createTextNode(
                          `No one has taken the task yet.`
                        );
                        d1.appendChild(t1);
                        innerDiv.appendChild(d1);
                      }
                    }

                    outerDiv.appendChild(innerDiv);
                    document
                      .querySelector(".message-box")
                      .appendChild(outerDiv);

                    var objDiv = document.getElementById("chat-box");
                    objDiv.scrollTop = objDiv.scrollHeight;
                  }
                }
              });

            document
              .getElementById("task-submit")
              .addEventListener("click", function(e) {
                let value1 = document.getElementById("task-1").value;
                let value2 = document.getElementById("task-2").value;
                let value3 = document.getElementById("task-textarea").value;

                //send task
                let url2 = `http://10.114.32.77:8080/WebApplication1/ws/msg?dpm_id=${id}&sender_id=${
                  JSON.parse(localStorage.user).id
                }&description=${value1}&details=${value3}&place=${value2}`;
                if (value1 !== "" && value2 !== "" && value3 !== "") {
                  fetch(url2, {
                    method: "POST"
                  });
                  sendTask();
                }

                document.getElementById("task-1").value = "";
                document.getElementById("task-2").value = "";
                document.getElementById("task-textarea").value = "";

                closeTaskContainer();
              });

            //send msg if the enter key is pressed
            document
              .querySelector("#inputbox")
              .addEventListener("keypress", function(e) {
                let value = document.getElementById("inputbox").value;
                let url2 = `http://10.114.32.77:8080/WebApplication1/ws/msg?dpm_id=${id}&sender_id=${
                  JSON.parse(localStorage.user).id
                }&content=${value}`;

                var key = e.which || e.keyCode;
                if (key === 13 && value !== "") {
                  fetch(url2, {
                    method: "POST"
                  });
                  sendMsg();
                  let mess = {
                    content: value,
                    senderId: JSON.parse(localStorage.user).id
                  };
                  socket.send(JSON.stringify(mess));
                }
              });

            //or the button send is pressed
            document
              .querySelector("#send")
              .addEventListener("click", function(e) {
                let value = document.getElementById("inputbox").value;
                let url2 = `http://10.114.32.77:8080/WebApplication1/ws/msg?dpm_id=${id}&sender_id=${
                  JSON.parse(localStorage.user).id
                }&content=${value}`;

                if (value !== "") {
                  fetch(url2, {
                    method: "POST"
                  });
                  sendMsg();
                }
              });
          });
        }
      });
  });

  //behaviour if section 3 button is clicked
  document.getElementById("section3").addEventListener("click", function() {
    document.querySelector(".user-chat-column").style.display = "none";
    document.querySelector(".group-chat-column").style.display = "none";
    document.querySelector(".ann-column").style.display = "block";
    document.querySelector(".input-box").style.display = "none";
    document.querySelector(".message-box").style.display = "none";
    document.querySelector(".user-info-area").style.display = "none";

    //same as section 2
    if (window.innerWidth < 1000) {
      document
        .querySelector(".id-displayer")
        .classList.remove("id-displayer-group");
    }

    let list = document.querySelector(".ann-list");
    list.innerHTML = "";
    let url = `http://10.114.32.77:8080/WebApplication1/ws/announcement`;

    //get the announcement list if the section 3 button is clicked
    fetch(url, {
      method: "GET"
    })
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => xmlToJson(data))
      .then(function(response) {
        for (let element of response.announcements.announcement) {
          let { creatorId, description, id, title } = element;

          //display announcements list

          let boxDiv = document.createElement("div");
          let titleDiv = document.createElement("div");
          let introDiv = document.createElement("div");
          boxDiv.classList.add("ann-box");
          titleDiv.classList.add("ann-title");
          introDiv.classList.add("ann-intro");
          let textnode1 = document.createTextNode(title);
          let textnode2 = document.createTextNode(description);
          titleDiv.appendChild(textnode1);
          introDiv.appendChild(textnode2);
          boxDiv.appendChild(titleDiv);
          boxDiv.appendChild(introDiv);

          list.insertBefore(boxDiv, list.childNodes[0]);
        }
      });
  });

  //back button on mobile
  document.querySelector(".back-button").addEventListener("click", function() {
    document.querySelector(".main").style.transform = "translateX(0)";
    document.querySelector(".section-div").style.display = "block";
  });

  function openAdminContainer() {
    document.getElementById("backdrop").style.display = "block";
    document.querySelector(".wrap-div").style.display = "flex";
    document.querySelector(".wrap-div").style.opacity = "1";
    document.querySelector(".admin-container").style.display = "block";
  }

  function closeAdminContainer() {
    document.getElementById("backdrop").style.display = "none";
    document.querySelector(".wrap-div").style.display = "none";
    document.querySelector(".wrap-div").style.opacity = "0";
    document.querySelector(".admin-container").style.display = "none";
  }

  function openAnnContainer() {
    document.getElementById("backdrop").style.display = "block";
    document.querySelector(".wrap-div").style.display = "flex";
    document.querySelector(".wrap-div").style.opacity = "1";
    document.querySelector(".new-ann-container").style.display = "block";
  }

  function closeAnnContainer() {
    document.getElementById("backdrop").style.display = "none";
    document.querySelector(".wrap-div").style.display = "none";
    document.querySelector(".wrap-div").style.opacity = "0";
    document.querySelector(".new-ann-container").style.display = "none";
  }

  function openTaskContainer() {
    document.getElementById("backdrop").style.display = "block";
    document.querySelector(".wrap-div").style.display = "flex";
    document.querySelector(".wrap-div").style.opacity = "1";
    document.querySelector(".new-task-container").style.display = "block";
  }

  function closeTaskContainer() {
    document.getElementById("backdrop").style.display = "none";
    document.querySelector(".wrap-div").style.display = "none";
    document.querySelector(".wrap-div").style.opacity = "0";
    document.querySelector(".new-task-container").style.display = "none";
  }

  function sendMsg() {
    let val = document.getElementById("inputbox").value;
    let textnode = document.createTextNode(val);

    let innerDiv = document.createElement("div");
    let outerDiv = document.createElement("div");
    let classlist = [
      "message-div",
      "animated",
      "slideInRight",
      "new-msg",
      "msg-send"
    ];
    innerDiv.classList.add("chat-message");
    outerDiv.classList.add(...classlist);
    innerDiv.appendChild(textnode);
    outerDiv.appendChild(innerDiv);
    document.querySelector(".message-box").appendChild(outerDiv);

    document.getElementById("inputbox").value = "";

    var objDiv = document.getElementById("chat-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  function sendTask() {
    console.log("do send task");
    console.log(document.getElementById("task-1").value);

    let textnode1 = document.createTextNode(
      document.getElementById("task-1").value
    );
    let textnode2 = document.createTextNode(
      document.getElementById("task-2").value
    );
    let textnode3 = document.createTextNode(
      document.getElementById("task-textarea").value
    );
    let textnode0 = document.createTextNode("You've sent this task.");
    let div0 = document.createElement("div");
    let div1 = document.createElement("div");
    let div2 = document.createElement("div");
    let div3 = document.createElement("div");
    let innerDiv = document.createElement("div");
    let outerDiv = document.createElement("div");
    let text1 = document.createTextNode("Task Name: ");
    let text2 = document.createTextNode("Location: ");
    let text3 = document.createTextNode("Details: ");

    div0.appendChild(textnode0);
    div1.style.marginTop = "10px";
    div1.appendChild(text1);
    div1.appendChild(textnode1);
    div2.appendChild(text2);
    div2.appendChild(textnode2);
    div3.appendChild(text3);
    div3.appendChild(textnode3);
    innerDiv.classList.add("chat-message");
    outerDiv.classList.add("task-div", "msg-send", "slideInRight", "animated");
    innerDiv.appendChild(div0);
    innerDiv.appendChild(div1);
    innerDiv.appendChild(div2);
    innerDiv.appendChild(div3);
    outerDiv.appendChild(innerDiv);
    document.querySelector(".message-box").appendChild(outerDiv);

    var objDiv = document.getElementById("chat-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  document.querySelector(".ann-button").addEventListener("click", function() {
    openAnnContainer();
  });
  document.querySelector("#admin-nav").addEventListener("click", function() {
    openAdminContainer();
  });

  document
    .querySelector(".admin-container")
    .addEventListener("click", function(event) {
      if (event.target === document.querySelector(".admin-submit")) {
        let username = document.getElementById("admin-1").value;
        let id = document.getElementById("admin-2").value;
        let phone = document.getElementById("admin-3").value;

        //check if the fields are empty, get info and make fetch POST call

        if (username !== "" && id !== "" && phone !== "") {
          let url = `http://10.114.32.77:8080/WebApplication1/ws/users/new?username=${username}&dpm_id=${id}&phone=${phone}`;
          fetch(url, {
            method: "POST"
          });
        }
        closeAdminContainer();
      }
    });

  //close buttons behaviours
  document
    .querySelector(".new-task-container")
    .addEventListener("click", function(event) {
      if (
        event.target === document.getElementById("close2") ||
        event.target === document.getElementById("close2").childNodes[0]
      )
        closeTaskContainer();
    });
  document
    .querySelector(".admin-container")
    .addEventListener("click", function(event) {
      if (
        event.target === document.getElementById("close3") ||
        event.target === document.getElementById("close3").childNodes[0]
      )
        closeAdminContainer();
    });

  document
    .querySelector(".new-ann-container")
    .addEventListener("click", function(event) {
      console.log(event.target);
      if (
        event.target === document.getElementById("close") ||
        event.target === document.getElementById("close").childNodes[0]
      )
        closeAnnContainer();

      if (event.target === document.querySelector(".ann-submit")) {
        let annTitle = document.querySelector(".ann-input-title").value;
        let annTextarea = document.getElementById("ann-textarea").value;
        let annCreator = document.getElementById("nav-username").innerHTML;

        //check if the fields are empty, create a div with the info get earlier
        if (annTitle !== "" && annTextarea !== "") {
          let boxDiv = document.createElement("div");
          let titleDiv = document.createElement("div");
          let introDiv = document.createElement("div");
          // let creatorDiv = document.createElement("div");
          boxDiv.classList.add("ann-box");
          titleDiv.classList.add("ann-title");
          introDiv.classList.add("ann-intro");
          // creatorDiv.classList.add("ann-creator");
          let textnode1 = document.createTextNode(annTitle);
          let textnode2 = document.createTextNode(annTextarea);
          // let textnode3 = document.createTextNode(annCreator);
          titleDiv.appendChild(textnode1);
          introDiv.appendChild(textnode2);
          // creatorDiv.appendChild(textnode3);
          boxDiv.appendChild(titleDiv);
          boxDiv.appendChild(introDiv);
          // boxDiv.appendChild(creatorDiv)

          let list = document.querySelector(".ann-list");
          list.insertBefore(boxDiv, list.childNodes[0]);
          closeAnnContainer();
          document.querySelector(".ann-input-title").value = "";
          document.getElementById("ann-textarea").value = "";
          // document.getElementById("ann-creator").value = "";
          let url = `http://10.114.32.77:8080/WebApplication1/ws/announcement?title=${annTitle}&description=${annTextarea}&creator_id=${
            JSON.parse(localStorage.user).id
          }`;

          fetch(url, {
            method: "POST"
          });
        }
      }
    });

  document
    .querySelector(".input-box")
    .addEventListener("click", function(event) {
      console.log(event.target);
      if (
        event.target === document.getElementById("task") ||
        event.target === document.getElementById("task").childNodes[0] ||
        event.target === document.getElementById("task").parentElement
      )
        openTaskContainer();
    });

  //display annnouncement if the ann box is clicked
  document
    .querySelector(".ann-list")
    .addEventListener("click", function(event) {
      if (window.innerWidth < 1000) {
        document.querySelector(".main").style.transform = " translateX(-100%)";
        document
          .querySelector(".id-displayer")
          .classList.add("id-displayer-group");
        document.querySelector(".section-div").style.display = "none";
      }
      let el;
      console.log(event.target);
      if (event.target.classList.contains("ann-box")) el = event.target;
      if (
        event.target.classList.contains("ann-title") ||
        event.target.classList.contains("ann-intro")
      )
        el = event.target.parentElement;
      let title, intro;
      var children = el.childNodes;
      title = children[0].textContent;
      intro = children[1].textContent;
      document.querySelector(".id-displayer").textContent = title;
      document.querySelector(".status-displayer").style.display = "none";
      document.querySelector(".message-box").style.display = "none";

      document.querySelector(".ann-info").style.display = "block";

      document.querySelector(".ann-info").textContent = intro;
    });

  var statusArray = document.querySelectorAll("#status-dropdown-content a");
  var status_code;

  //change status and make fetch PUT call to the server
  for (let element of statusArray) {
    element.addEventListener("click", function(event) {
      let text;
      if (event.target.tagName === "A") {
        text = event.target.childNodes[3].textContent;
      } else {
        text = event.target.parentElement.childNodes[3].textContent;
      }

      let userObj = JSON.parse(localStorage.user);
      console.log(userObj);

      switch (text) {
        case "Online":
          document.querySelector("#status-dropdown .avatar svg").style.color =
            "#1bd139";
          status_code = 1;
          break;
        case "Idle":
          document.querySelector("#status-dropdown .avatar svg").style.color =
            "#ccb80c";
          status_code = 2;
          break;
        case "Busy":
          document.querySelector("#status-dropdown .avatar svg").style.color =
            "#cc0c0c";
          status_code = 3;
          break;
        default:
          document.querySelector("#status-dropdown .avatar svg").style.color =
            "#adbabc";
          status_code = 4;
      }

      userObj.statusCode = status_code;
      localStorage.setItem("user", JSON.stringify(userObj));

      let url = `http://10.114.32.77:8080/WebApplication1/ws/users/${
        JSON.parse(localStorage.user).id
      }/${status_code}`;

      fetch(url, {
        method: "PUT"
      });
    });
  }

  //logout if the button is clicked
  document.getElementById("logout").addEventListener("click", function() {
    window.location.replace("http://10.114.32.77:8080/WebApplication1/");
  });
});
