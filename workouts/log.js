$(function() {
	$.extend(WorkoutLog, {
		log: {
			workouts: [],

			setDefinitions: function() {
				var defs = WorkoutLog.definition.userDefinitions;
				var len = defs.length;
				var opts;
				for (var i = 0; i < len; i++) {
					opts += "<option value='" + defs[i].id +"'>" + defs[i].description + "</option>";
				}
				$("#log-definition").children().remove();
				$("#log-definition").append(opts);
				$("#update-definition").children().remove();
				$("#update-definition").append(opts)
			},

			setHistory: function() {
				var history = WorkoutLog.log.workouts;
				var len = history.length;
				var lis = "";
					for (var i = 0; i < len; i++) {
					lis += "<li class='list-group-item'>" + 
					// history[i].id + " - " + 
					history[i].def + " - " + 
					history[i].result + " " +
					// pass the log.id into the button's id attribute // watch your quotes!
					"<div class='pull-right'>" +
						"<button id='" + history[i].id + "' class='update'><strong>U</strong></button>" +
						"<button id='" + history[i].id + "' class='remove'><strong>X</strong></button>" +
					"</div></li>";
				}
				$("#history-list").children().remove();
				$("#history-list").append(lis);
			},
			create: function() {
				var itsLog = { 
		        	desc: $("#log-description").val(),
		         	result: $("#log-result").val(),
		         	def: $("#log-definition option:selected").text()
		      	};
		      	var postData = { log: itsLog };
		      	var logger = $.ajax({
		         	type: "POST",
		         	url: WorkoutLog.API_BASE + "log",
		         	data: JSON.stringify(postData),
		         	contentType: "application/json"
		      	});

		      	logger.done(function(data) {
	      			WorkoutLog.log.workouts.push(data);
	      			$("#log-description").val("");
					$("#log-result").val("");
					$('a[href="#history"]').tab("show");
		      	});
			},

			delete: function(){
				var thisLog = {
					// "this" is the button on the li
			//.attr("id") targets the value of the id attribute of button
					id: $(this).attr("id")
				};
				var deleteData = { log: thisLog };
				var deleteLog = $.ajax({
					type: "DELETE",
					url: WorkoutLog.API_BASE + "log",
					data: JSON.stringify(deleteData),
					contentType: "application/json"
				});

				// removes list item
				// references button then grabs closest li
				$(this).closest("li").remove();

				// deletes item out of workouts array
				for(var i = 0; i < WorkoutLog.log.workouts.length; i++){
					if(WorkoutLog.log.workouts[i].id == thisLog.id){
						WorkoutLog.log.workouts.splice(i, 1);
					}
				}
				deleteLog.fail(function(){
					console.log("nope. you didn't delete it.");
				});
			},

			// history
			fetchAll: function() {
				var fetchDefs = $.ajax({
			         type: "GET",
			         url: WorkoutLog.API_BASE + "log",
			         headers: {
			         	"authorization": window.localStorage.getItem("sessionToken")
			         }
			      })
			      .done(function(data) {
			         WorkoutLog.log.workouts = data;
			      })
			      .fail(function(err) {
			         console.log(err);
			      });
			}
		}
	});

	$("#log-save").on("click", WorkoutLog.log.create);
	$("#history-list").delegate('.remove', 'click', WorkoutLog.log.delete);

	   // fetch history if we already are authenticated and refreshed
   if (window.localStorage.getItem("sessionToken")) {
      WorkoutLog.log.fetchAll();
   }
});