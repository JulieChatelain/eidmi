app.service('RestService', ['$log', '$http', 'FHIR',  function($log, $http, FHIR) {

    var url = "http://localhost:3000/ehr";
    
    return {
    	register: function(password, email, givenName, familyName, next){
    		
    		var data = {
    				email: email,
    				password: password,
    				givenName: givenName,
    				familyName: familyName,
    				userKind: 'practitioner'
    		};
    		$http.post(url + '/register', data).then(function(res){
    			next(res.data.success, res.data.message, res.data.user, res.data.token)
    		});
    	},
    	login: function(password, email, next){
    		var data = {
    				email: email,
    				password: password
    		};
    		$http.post(url + '/login', data).then(function(res){
    			next(res.data.success, res.data.message, res.data.user, res.data.token)
    		});
    	},
    	sendPatientRecord: function(user, patient, next){
    		FHIR.patient(user, patient);
    		$http.post(url + '/rest/Patient', patient).then(function(res){
    			next(res.data.success, res.data.message, res.data.id)
    		});
    	},
    	sendObservation: function(user, patient, observation, next){
    		FHIR.observation(user, patient, observation);
    		$http.post(url + '/rest/patientId/' + patient.idOnServer 
    				+ '/Observation', observation).then(function(res){
    			next(res.data.success, res.data.message, res.data.id)
    		});
    	},
    	updateResource: function(user, patient, resource, resourceType, next){
    		switch(resourceType){
    		case 'Observation': FHIR.observation(user, patient, resource); break;
    		case 'Patient': FHIR.patient(user, patient); break;
    		}
    		$http.put(url + '/rest/patientId/' + patient.idOnServer 
    				+ '/' + resourceType + '/' + resource.idOnServer, resource).then(function(res){
    			if(res.data.success){
    				/*
	    			DBService.removeFromListForServer(resource, resourceType, function(success){
	        			next(res.data.success, res.data.message);
	    			});*/
    			}else{
    				if(resource.shared){/*
    					DBService.addToListForServer(resource, resourceType, function(success){
    	        			next(res.data.success, res.data.message);
    	    			});*/
    				}
    			}
    		});
    	},
        patients: function(next) {
            $http.get(url + '/rest/Patient').then(next);
        },
        patient: function(patientId, next) {
            $http.get(url + '/rest/patientId/' + patientId + '/Patient').then(next);
        },
		getResources : function(patientId, resourceType, next) {
			$http.get(url + '/rest/patientId/' + patientId + '/'
							+ resourceType).then(next);
		},
		getResource : function(patientId, resourceType, resourceId, next) {
			$http.get(url + '/rest/patientId/' + patientId + '/'
							+ resourceType + '/' + resourceId).then(next);
		},
		requestAccess : function(code, doctorName, givenName, familyName, next) {
			var data = {
				code : code,
				practitionerName : doctorName,
				givenName : givenName,
				familyName : familyName
			};
			$http.post(url + '/requestAccess', data).then(next);
		}
    }
}]);