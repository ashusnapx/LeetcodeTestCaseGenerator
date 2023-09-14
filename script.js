document.addEventListener( "DOMContentLoaded", () => {
    const userProfilesDiv = document.getElementById( "userProfiles" );
    const compareBtn = document.getElementById( "compareBtn" );
    const singleProfileInput = document.getElementById( "singleProfileInput" );
    const multiProfileInput = document.getElementById( "multiProfileInput" );
    const numProfilesSelect = document.getElementById( "numProfiles" );

    const clearComparisonBtn = document.getElementById( "clearComparisonBtn" );

    clearComparisonBtn.addEventListener( "click", () => {
        localStorage.removeItem( "lastComparison" );
        userProfilesDiv.innerHTML = "";
        document.getElementById( "username" ).value = "";
        document.getElementById( "username1" ).value = "";
        document.getElementById( "username2" ).value = "";
        document.getElementById( "username3" ).value = "";
        document.getElementById( "username4" ).value = "";
        document.getElementById( "username5" ).value = "";
    } );

    const profileOption = document.getElementsByName( "profileOption" );
    profileOption.forEach( option => {
        option.addEventListener( "change", () => {
            if ( option.id === "singleProfile" ) {
                singleProfileInput.style.display = "block";
                multiProfileInput.style.display = "none";
                numProfilesSelect.style.display = "none";
            } else {
                singleProfileInput.style.display = "none";
                multiProfileInput.style.display = "block";
                numProfilesSelect.style.display = "inline";
            }
        } );
    } );

    numProfilesSelect.addEventListener( "change", () => {
        const numProfiles = numProfilesSelect.value;
        for ( let i = 1; i <= 5; i++ ) {
            const inputField = document.getElementById( `username${ i }` );
            if ( i <= numProfiles ) {
                inputField.style.display = "block";
            } else {
                inputField.style.display = "none";
            }
        }
    } );

    compareBtn.addEventListener( "click", () => {
        let usernames = [];
        let labels = [];

        if ( singleProfileInput.style.display === "block" ) {
            const inputField = document.getElementById( "username" );
            const input = inputField.value.trim();

            if ( input ) {
                usernames.push( input );
                labels.push( getLabelFromInput( input ) );
            } else {
                alert( "Please enter a username or profile link." );
                return;
            }
        } else {
            const numProfiles = numProfilesSelect.value;
            for ( let i = 1; i <= numProfiles; i++ ) {
                const inputField = document.getElementById( `username${ i }` );
                const input = inputField.value.trim();

                if ( input ) {
                    usernames.push( input );
                    labels.push( getLabelFromInput( input ) );
                }
            }
        }

        if ( usernames.length < 1 ) { // Check for at least one username here
            alert( "Please enter at least one username." );
            return;
        }

        Promise.all( usernames.map( username => fetchLeetCodeProfile( username ) ) )
            .then( profiles => {
                if ( profiles.length > 0 ) {
                    displayComparison( userProfilesDiv, profiles, labels );
                    saveComparisonToStorage( usernames, profiles, labels );
                } else {
                    alert( "No valid profiles to compare." );
                }
            } )
            .catch( error => {
                console.error( "Error fetching profiles:", error );
            } );
    } );





    function getLabelFromInput( input ) {
        if ( input.startsWith( "https://leetcode.com/" ) ) {
            return "Profile Link";
        } else {
            return input;
        }
    }

    function fetchLeetCodeProfile( username ) {
        const apiUrl = `https://leetcode-api-faisalshohag.vercel.app/${ username }`;
        return fetch( apiUrl )
            .then( response => response.json() )
            .catch( error => {
                console.error( "Error fetching profile:", error );
                throw error;
            } );
    }

    function displayComparison( container, profiles, labels ) {
        const comparisonDiv = document.createElement( "div" );
        comparisonDiv.classList.add( "comparison" );

        const table = document.createElement( "table" );
        table.classList.add( "comparison-table" );

        const tableHeaders = document.createElement( "tr" );
        tableHeaders.innerHTML = "<th>Metric</th>" + labels.map( label => `<th>${ label }</th>` ).join( "" );
        table.appendChild( tableHeaders );

        const metrics = [
            { label: "Easy Solved", key: "easySolved", totalKey: "totalEasy" },
            { label: "Medium Solved", key: "mediumSolved", totalKey: "totalMedium" },
            { label: "Hard Solved", key: "hardSolved", totalKey: "totalHard" },
            { label: "Total Questions", key: "totalQuestions" },
            { label: "Total Submissions", key: "totalSubmissions", isObject: true },
            { label: "Ranking", key: "ranking" },
            { label: "Reputation", key: "reputation" },
        ];

        metrics.forEach( metric => {
            const row = document.createElement( "tr" );
            row.innerHTML = `
            <td>${ metric.label }</td>
            ${ profiles.map( profile => {
                const value = metric.isObject ? profile[ metric.key ].map( item => `${ item.difficulty }: ${ item.count }` ).join( ", " ) : profile[ metric.key ];
                return `<td>${ value }</td>`;
            } ).join( "" ) }
        `;
            table.appendChild( row );
        } );

        comparisonDiv.appendChild( table );

        container.innerHTML = "";
        container.appendChild( comparisonDiv );
    }




    function saveComparisonToStorage( usernames, profiles, labels ) {
        const comparisonData = {
            usernames,
            profiles,
            labels,
        };
        localStorage.setItem( "lastComparison", JSON.stringify( comparisonData ) );
    }

    function loadLastComparison() {
        const comparisonData = JSON.parse( localStorage.getItem( "lastComparison" ) );
        if ( comparisonData ) {
            const { usernames, profiles, labels } = comparisonData;
            displayComparison( userProfilesDiv, profiles, labels );
            if ( usernames.length === 1 ) {
                document.getElementById( "singleProfile" ).checked = true;
                document.getElementById( "username" ).value = usernames[ 0 ];
            } else {
                document.getElementById( "multiProfile" ).checked = true;
                document.getElementById( "numProfiles" ).value = usernames.length.toString();
                numProfilesSelect.style.display = "inline";
                numProfilesSelect.dispatchEvent( new Event( "change" ) ); // Trigger the change event to show the correct number of input fields
                usernames.forEach( ( username, index ) => {
                    document.getElementById( `username${ index + 1 }` ).value = username;
                } );
            }
        }
    }

    loadLastComparison();
} );
