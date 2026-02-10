document.addEventListener("DOMContentLoaded", function () {
    const searchbutton = document.getElementById("search-btn");
    const usernameinput = document.getElementById('user-input');
    const statscontainer = document.querySelector('.stats-container');
    const easyprogresscircle = document.querySelector('.easy-progress');
    const mediumprogresscircle = document.querySelector('.medium-progress');
    const hardprogresscircle = document.querySelector('.hard-progress');
    const easyLabel = document.getElementById('easy-level');
    const mediumLabel = document.getElementById('medium-level');
    const hardLabel = document.getElementById('hard-level');
    const cardststscontainer = document.querySelector('.stats-card');

    function validusername(username) {
        if (username.trim() === "") {
            alert("Username shoud not be empty");
            return false;
        }
        const regex = /^[A-Za-z_]+$/;
        const ismatching = regex.test(username);
        if (!ismatching) {
            alert("Invalid username");
        }
        return ismatching;
    }

    async function fetchuserdetails(username) {
        try {
            searchbutton.textContent = "Searching....";
            searchbutton.disabled = true;

            const proxyurl = 'https://cors-anywhere.herokuapp.com/'
            const targeturl = "https://leetcode.com/graphql/";
            const myheader = new Headers();
            myheader.append("Content-Type", "application/json");

            const graphql = JSON.stringify({
                query: `
query userSessionProgress($username: String!) {
  allQuestionsCount {
    difficulty
    count
  }
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
}
`,
                variables: {
                    "username":`${username}` 
                }
            });

            const requestoption = {
                method: 'POST',
                headers: myheader,
                body: graphql,
                redirect: 'follow'
            };

            const response = await fetch(proxyurl+targeturl, requestoption);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details ");
            }

            const pastesdata = await response.json();
            console.log('Logging data: ', pastesdata);

            displayuserdata(pastesdata);

        } catch (error) {
            statscontainer.innerHTML = `<p> ${error.message} </p>`;
        } finally {
            searchbutton.textContent = 'Search';
            searchbutton.disabled = false;
        }
    }

    function updateprogress(solved, total, lavel, circle){
        const progressdegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressdegree}%`);
        lavel.textContent = `${solved}/${total}`;
    }

    function displayuserdata(pastesdata){
        const totalques = pastesdata.data.allQuestionsCount[0].count;
        const totaleasyques = pastesdata.data.allQuestionsCount[1].count;
        const totalmediumques = pastesdata.data.allQuestionsCount[2].count;
        const totalhardques = pastesdata.data.allQuestionsCount[3].count;

        const solvedtotalques = pastesdata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedtotaleasyques = pastesdata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedtotalmediumques = pastesdata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedtotalhardques = pastesdata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateprogress(solvedtotaleasyques, totaleasyques, easyLabel, easyprogresscircle);
        updateprogress(solvedtotalmediumques, totalmediumques, mediumLabel, mediumprogresscircle);
        updateprogress(solvedtotalhardques, totalhardques, hardLabel, hardprogresscircle);

        const carddata = [
            {
                label:"Overall Submission",
                value : pastesdata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions
            },
            {
                label:"Overall Easy Submission",
                value : pastesdata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions
            },
            {
                label:"Overall Medium Submission",
                value : pastesdata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions
            },
            {
                label:"Overall Hard Submission",
                value : pastesdata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions
            }
        ];
        console.log("Card ka data : ", carddata)
        cardststscontainer.innerHTML = carddata.map(data=>{
            return `
            <div class='card'>
            <h4>${data.label}</h4>
            <p>${data.value}</p>
            </div>
            `
        }).join("");
    }

    searchbutton.addEventListener('click', function () {
        const username = usernameinput.value;
        console.log("Logging username :", username);
        if (validusername(username)) {
            fetchuserdetails(username);
        }
    });

});
