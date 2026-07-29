$(document).ready(function(){
    // --- Common: Load Menu ---
    $.getJSON('../json/menu.json', function(data) {
        let menuHtml = '<ul>';
        $.each(data, function(index, item) {
            let url = item.toLowerCase().replace(' ', '') + '.html';
            if (item === 'Home') {
                url = 'index.html';
            } else if (item === 'NewsAward') {
                url = 'newsaward.html';
            }
            menuHtml += '<li><a href="' + url + '">' + item + '</a></li>';
        });
        menuHtml += '</ul>';
        $('#gnb').html(menuHtml);
    });

    // --- Page-specific content loading ---
    const path = window.location.pathname;
    const page = path.split("/").pop().replace('.html', '');

    let jsonFile = '';
    if (page === 'index' || page === '') {
        jsonFile = '../json/home.json';
        loadAndRender('home', jsonFile);
    } else if (page === 'members') {
        jsonFile = '../json/members.json';
        loadAndRender('members', jsonFile);
    } else if (page === 'research') {
        jsonFile = '../json/research.json';
        loadAndRender('research', jsonFile);
    } else if (page === 'publications') {
        jsonFile = '../json/publications.json';
        loadAndRender('publications', jsonFile);
    } else if (page === 'ips') {
        jsonFile = '../json/ips.json';
        loadAndRender('ips', jsonFile);
    } else if (page === 'lecture') {
        jsonFile = '../json/lecture.json';
        loadAndRender('lecture', jsonFile);
    } else if (page === 'newsaward') {
        jsonFile = '../json/news_award.json';
        loadAndRender('newsaward', jsonFile);
    }
    // Add other pages here...

});

function loadAndRender(pageType, jsonFile) {
    $.getJSON(jsonFile, function(data) {
        switch(pageType) {
            case 'home':
                renderHome(data);
                break;
            case 'members':
                renderMembers(data);
                break;
            case 'research':
                renderResearch(data);
                break;
            case 'publications':
                renderPublications(data);
                break;
            case 'ips':
                renderIps(data);
                break;
            case 'lecture':
                renderLecture(data);
                break;
            case 'newsaward':
                renderNewsAward(data);
                break;
            // Add other cases here...
        }
    });
}

function renderHome(data) {
    let mainHtml = '';
    // Section 1: Welcome
    if(data.section1) {
        mainHtml += '<div class="container">';
        mainHtml += '<div class="welcome-section">';
        mainHtml += '<div class="row">';
        mainHtml += '<div class="col-md-4"><img src="../' + data.section1.image + '" class="img-responsive"></div>';
        mainHtml += '<div class="col-md-8">';
        mainHtml += '<h3>Welcome Message</h3>';
        mainHtml += '<pre>' + data.section1.english + '</pre>';
        mainHtml += '<h3>환영 메시지</h3>';
        mainHtml += '<pre>' + data.section1.korean + '</pre>';
        mainHtml += '</div></div></div></div>';
    }
    // Section 2: Research Highlights
    if(data.section2 && data.section2.length > 0) {
        mainHtml += '<div class="container">';
        mainHtml += '<div class="research-highlights">';
        mainHtml += '<h3>Research Highlights</h3>';
        mainHtml += '<div class="list-group">';
        $.each(data.section2, function(index, item) {
            let link = item.link ? item.link : '#';
            mainHtml += '<a href="' + link + '" class="list-group-item">';
            mainHtml += '<h4 class="list-group-item-heading">' + item.title + '</h4>';
            mainHtml += '</a>';
        });
        mainHtml += '</div></div></div>';
    }
    $('#main').html(mainHtml);
}

function renderMembers(data) {
    let membersHtml = '';
    
    // Director
    if (data.Director) {
        membersHtml += '<h3>Director</h3>';
        membersHtml += '<div class="row">';
        $.each(data.Director, function(i, member){
            membersHtml += createMemberCard(member);
        });
        membersHtml += '</div>';
    }

    // Researchers
    if (data.Researchers) {
        membersHtml += '<h3>Researchers</h3>';
        membersHtml += '<div class="row">';
        $.each(data.Researchers, function(i, member){
            membersHtml += createMemberCard(member);
        });
        membersHtml += '</div>';
    }

    // Alumni
    if (data.Alumni) {
        membersHtml += '<h3>Alumni</h3>';
        membersHtml += '<div class="row">';
         $.each(data.Alumni, function(i, member){
            membersHtml += createMemberCard(member);
        });
        membersHtml += '</div>';
    }

    $('#members-content').html(membersHtml);
}

function createMemberCard(member) {
    let card = '<div class="col-md-6 col-sm-12"><div class="member-card">';
    card += '<div class="row">'
    card += '<div class="col-md-4"><img src="../' + (member.사진 || 'files/no image.jpg') + '" class="img-responsive member-photo"></div>';
    card += '<div class="col-md-8">';
    card += '<h4>' + (member.이름 || '') + '</h4>';
    card += '<p><strong>' + (member.직책 || member.학위 || '') + '</strong></p>';
    if (member["E-mail"]) card += '<p><strong>Email:</strong> ' + member["E-mail"] + '</p>';
    if (member.Education) card += '<p><strong>Education:</strong> ' + member.Education.replace(/\n/g, "<br>") + '</p>';
    if (member["Research area"]) card += '<p><strong>Research:</strong> ' + member["Research area"].replace(/\n/g, "<br>") + '</p>';
    if (member["졸업 후 진로"]) card += '<p><strong>After Graduation:</strong> ' + member["졸업 후 진로"] + '</p>';
    card += '</div></div></div></div>';
    return card;
}

function renderResearch(data) {
    let researchHtml = '';
    $.each(data, function(category, projects) {
        researchHtml += '<div class="research-category">';
        researchHtml += '<h3>' + category + '</h3>';
        researchHtml += '<div class="row">';
        $.each(projects, function(i, project) {
            researchHtml += '<div class="col-md-4 col-sm-6">';
            researchHtml += '<div class="research-card">';
            researchHtml += '<img src="../' + project.대표이미지 + '" class="img-responsive">';
            researchHtml += '<div class="research-card-body">';
            researchHtml += '<h4>' + project.Title + '</h4>';
            researchHtml += '<p>' + project['세부 Description'] + '</p>';
            if (project.Link) {
                let links = project.Link.split(',');
                $.each(links, function(i, link){
                     researchHtml += '<a href="' + link.trim() + '" target="_blank" class="btn btn-primary btn-xs">Link ' + (i+1) + '</a> ';
                });
            }
            researchHtml += '</div></div></div>';
        });
        researchHtml += '</div></div>';
    });
    $('#research-content').html(researchHtml);
}

function renderPublications(data) {
    let publicationsHtml = '';
    $.each(data, function(category, publications) {
        publicationsHtml += '<div class="publication-category">';
        publicationsHtml += '<h3>' + category + '</h3>';
        publicationsHtml += '<ul class="publication-list">';
        $.each(publications, function(i, pub) {
            publicationsHtml += '<li>';
            publicationsHtml += '<p>' + pub.Title + '</p>';
            if (pub.Link && pub.Link.trim().toLowerCase() !== 'doi') {
                publicationsHtml += '<a href="' + pub.Link.trim() + '" target="_blank" class="btn btn-info btn-xs">View Link</a>';
            }
            publicationsHtml += '</li>';
        });
        publicationsHtml += '</ul></div>';
    });
    $('#publications-content').html(publicationsHtml);
}

function renderIps(data) {
    let ipsHtml = '';
    $.each(data, function(category, ips) {
        if (ips.length > 0) {
            ipsHtml += '<div class="ip-category">';
            ipsHtml += '<h3>' + category + '</h3>';
            ipsHtml += '<ul class="ip-list">';
            $.each(ips, function(i, ip) {
                ipsHtml += '<li>' + ip.Title + '</li>';
            });
            ipsHtml += '</ul></div>';
        }
    });
    $('#ips-content').html(ipsHtml);
}

function renderLecture(data) {
    let lectureHtml = '<div class="alert alert-info">' + data.message + '</div>';
    $('#lecture-content').html(lectureHtml);
}

function renderNewsAward(data) {
    let newsawardHtml = '';
    $.each(data, function(category, items) {
        newsawardHtml += '<div class="newsaward-category">';
        newsawardHtml += '<h3>' + category + '</h3>';
        $.each(items, function(i, item) {
            newsawardHtml += '<div class="newsaward-item panel panel-default">';
            newsawardHtml += '<div class="panel-heading"><h4>' + item.Title + '</h4></div>';
            newsawardHtml += '<div class="panel-body">';
            newsawardHtml += '<div class="row">';
            newsawardHtml += '<div class="col-md-4"><img src="../' + item.Image + '" class="img-responsive"></div>';
            newsawardHtml += '<div class="col-md-8"><p>' + item.Text + '</p></div>';
            newsawardHtml += '</div></div></div>';
        });
        newsawardHtml += '</div>';
    });
    $('#newsaward-content').html(newsawardHtml);
}
