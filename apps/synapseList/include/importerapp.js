ImporterApp = function (args,configFile)
{
    this.args = args;
    this.configFile = configFile
    this.selectedNeurons = {};
};


ImporterApp.prototype.Init = function()
{
    this.cfg = {}
    var self = this
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
            self.cfg = JSON.parse(this.responseText);
	    self.GetCellDisplay(function(){self.SetupPage()});
	}
    };
    xmlhttp.open("GET", this.configFile, true);
    xmlhttp.send();    
};


ImporterApp.prototype.SetupPage = function()
{
    var self = this;
    var side = document.getElementById('menu');
    sidebar = new SideBar(side);
    sidebar.addSeriesSelector(this.cfg,function(){self.GetCellDisplay()});

    
    var top = document.getElementById('top');
    topbar = new TopBar(top);
    topbar.addHelp(this.cfg.help);
    topbar.addCellSelector(function(){return self.GetCells()},
	    		   function(){self.CellSelector()});  
    topbar.addButton('Partner list',
		     function(){
			 var url = self.cfg.partnerList_url
			 if (self.args.db != null && self.args.cell != null){
			     url = url + '?db=' + self.args.db + '&cell=' + self.args.cell;
			 }			 
			 window.location.href = url;});

    if (this.args.db != null && this.args.cell != null){
	this.LoadCell(this.args.db,this.args.cell);
    }
};

ImporterApp.prototype.GetCells = function(){
    return this.selectedNeurons;
};

ImporterApp.prototype.GetCellDisplay = function(_callback)
{
    var self = this;
    var sex = this.cfg.sex_default;
    var db = this.cfg.db_default;
    if (document.getElementById('sex-selector') != null){
	sex = document.getElementById('sex-selector').value
    };
    if (document.getElementById('sex-selector') != null){
	db = document.getElementById('series-selector').value;    
    };
    var xhttp = new XMLHttpRequest();    
    var url = this.cfg.cell_selector + '?sex=' + sex +'&db='+ db;
    
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	   self.selectedNeurons = JSON.parse(this.responseText);
	   if (_callback != undefined){_callback()};  
	};
    };

    xhttp.open("GET",url,true);
    xhttp.send();
   
};

ImporterApp.prototype.CellSelector = function(){
    var db = document.getElementById('series-selector').value;
    for (var group in this.selectedNeurons){
	for (var i in this.selectedNeurons[group]){
	    if (this.selectedNeurons[group][i].visible == 1){
		this.args.db = db;
		this.args.cell = i;
		this.RemoveCell();
		this.LoadCell(db,i);
		this.selectedNeurons[group][i].visible = 0;
	    };
	};
    };
    
    
}

ImporterApp.prototype.RemoveCell = function()
{
    $('.synapse-parent').remove();
    $('.synapse-child').remove();
}


ImporterApp.prototype.LoadCell = function(_db,_cell)
{
    var self = this;
    var cellElem = document.getElementById('cell-name');
    cellElem.innerHTML = 'Cell Name: ' + _cell;

    var url = this.cfg.data_loader + "?continName=" + _cell + "&series=" + _db;
    var xhttp = new XMLHttpRequest();    
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    var data = JSON.parse(this.responseText);
	    var ptype = ['elec','pre','post']
	    for (let p of ptype){
		var tbl = document.getElementById(p);
		for (var i in data[p]){
		    var tr = document.createElement('tr');
		    tr.className = 'synapse-child';
		    for (var j=0; j<data[p][i].length;j++){
			var td = document.createElement('td');
			if ( j == 0){
			    td.colSpan = 3;
			    td.class = 'rcol';
			} else {
			    td.colSpan = 1;
			    td.class = 'lcol';
			};
			if (j == 1){
			    var a = document.createElement('a');
			    var href = self.cfg.synapse_viewer + '?neuron=' +
				_cell + '&db=' + _db + '&series=' + _db +
				'&continNum=' + data[p][i][j];
			    a.href = href;
			    a.innerHTML = data[p][i][j];
			    td.appendChild(a)
			} else {
			    td.innerHTML = data[p][i][j];
			};
			tr.appendChild(td)
		    };
		    tbl.appendChild(tr);
		};
		
	    };	    
	    
		
	    
	};
    };
    xhttp.open("GET",url,true);
    xhttp.send();
         
}


