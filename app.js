import request from 'request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let options = {
    method: 'GET',
    url: '',
    headers: {
        accept: 'application/vnd.github+json',
        'user-agent': '',
        authorization: '',
        'x-github-api-version': '2022-11-28'
    }
}

function getBillingSeats() {
    options.url = 'https://api.github.com/enterprises/XXXXXX/copilot/billing/seats?per_page=100';

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var jsonBody = JSON.parse(body);
        console.log(jsonBody.total_seats);

        var today = new Date();
        var priorDate = new Date(new Date().setDate(today.getDate() - 20));

        jsonBody.seats.forEach(function(element){
            var last_activity_at = new Date(element.last_activity_at)

            //console.log(element.assignee.login + ' - ' + element.last_activity_at);
            if (element.last_activity_at == null)
            {
                console.log(element.assignee.login + ' - ' + element.last_activity_at);
            } else {
                console.log(element.assignee.login + ' - ' + getDaysBetweenDates(last_activity_at, today));
            }
        });
    });
}

function getCopilotMetrics() {
    options.url = 'https://api.github.com/orgs/XXXXXX/copilot/metrics';

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var jsonBody = JSON.parse(body);

        jsonBody.forEach((element) => {
            console.log(element.date + ' - ' + element.total_active_users);

            console.log('Copilot IDE Code Completions')
            element.copilot_ide_code_completions.editors?.forEach((editor) => {
                console.log(editor.name);

                editor.models.forEach((model) => { printEngadedUserByLanguage(model.languages) })
            })

            console.log('Copilot IDE Chat')
            element.copilot_ide_chat.editors?.forEach((editor) => {
                printEngagedUserByEditor(editor);
            })
        });
    })
}

function printEngadedUserByLanguage(languages) {
    let total_engaged_users = 0;
    let total_code_acceptances = 0;
    let total_code_suggestions = 0;
    let total_code_lines_accepted = 0;
    let total_code_lines_suggested = 0;

    languages.forEach((language) => {
        total_engaged_users += language.total_engaged_users
        total_code_acceptances += language.total_code_acceptances
        total_code_suggestions += language.total_code_suggestions
        total_code_lines_accepted += language.total_code_lines_accepted
        total_code_lines_suggested += language.total_code_lines_suggested
    });

    languages.push({name: 'Total', total_engaged_users, total_code_acceptances, total_code_suggestions, total_code_lines_accepted, total_code_lines_suggested})
    console.table(languages);
}

function printEngagedUserByEditor(editor) {
    let total_engaged_users = 0;
    let total_chats = 0;
    let total_chat_insertion_events = 0;
    let total_chat_copy_events = 0;

    console.log(editor.name);

    editor.models.forEach((model) => {
        total_engaged_users += model.total_engaged_users
        total_chats += model.total_chats
        total_chat_insertion_events += model.total_chat_insertion_events
        total_chat_copy_events += model.total_chat_copy_events
    });

    editor.models.push({name: 'Total', total_engaged_users, total_chats, total_chat_insertion_events, total_chat_copy_events})
    console.table(editor.models)
}

function getDaysBetweenDates(dateEarly, dateLate) {
  const timeDiff = Math.abs(dateLate.getTime() - dateEarly.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
}

function executeMethodByParameter(methodToBeRunning) {
    switch (methodToBeRunning.toUpperCase()) {
        case 'S':
            getBillingSeats();
            break;
        case 'M':
            getCopilotMetrics();
            break;
        default:
            console.error("Invalid Parameter");
            break;
    }
}

const args = process?.argv.slice(2);
if (args.length > 0)
    executeMethodByParameter(args[0])
else
    console.error("Parameter not passed");
