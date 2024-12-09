Promise.all([d3.csv("REP_DEM_countypres_2000-2020.csv")])
.then(function(d){
    console.log(d)
    var countyData = d[0]
    var byState = formatByState(countyData)


    var byCounty = {}
    for(var s in byState){
        var stateData = byState[s]
        for(var c in stateData){
            var countyData = stateData[c]
            var countyId = String(countyData[0].county)
            byCounty[countyId]=countyData
        }
    }


var temp = [3,4,5,3,6,7]
var w = 300
var h = 300
var p = 30

var xScale = d3.scaleLinear().domain([-100,100]).range([0,w-p*3])
var yScale = d3.scaleLinear().domain([2000,2020]).range([0,h-p*2])
var widthScale = d3.scaleLinear().domain([1000,200000]).range([2,10])
//var colorScale = d3.scaleLinear().domain([-10,10]).range(["red","blue"])
var colorScale = d3.scaleLinear().domain([-5,5]).range(["blue","red"])

for(var s in byState){
    var stateData = byState[s]
    var svg = d3.select("#container").append("svg").attr("width",w).attr("height",h).append("g").attr("transform","translate("+p+","+p+")")
    svg.append("text").text(stateData[0][0].state).attr("x",-p/2).attr("y",-p/2)

    var yAxis = d3.axisLeft().scale(yScale).ticks(4).tickFormat(function(d){return String(d)}).tickValues([2000,2004,2008,2012,2016,2020]).tickSize(w-p*3)
    svg.append('g').call(yAxis).attr("transform","translate("+(w-p*2)+",0)").attr("opacity",".3")

    var xAxis = d3.axisBottom().scale(xScale).tickSize(h-p*2).ticks(5)
    svg.append("g").call(xAxis).attr("transform","translate("+p+",0)").attr("opacity",".3")

    for(var c in stateData){
        countyData = stateData[c]
        svg.append("path")
        .attr("transform","translate("+p+",0)")
        .attr("total",countyData[0].sum)
        .attr("name",countyData[0].name)
        .attr("state",countyData[0].state)
        .attr("county",countyData[0].county)
        .attr("countyFips",c)
        .attr('stroke',colorScale(countyData[0].rMinusD))
        .attr('fill',"none")
        .attr("stroke-width",widthScale(countyData[0].total))
        .attr("cursor","pointer")
        .attr("opacity",.2)
            .attr("class","lines")
            .attr("d",
                d3.line().curve(d3.curveBumpY)
                .x(function(d){return xScale(d.rMinusD)})
                .y(function(d,i){return yScale(d.year)})
                (countyData)
        )
        .on("mouseover",function(e,d){
            d3.select(this).attr("opacity",.8)

            d3.select("#label").html(d3.select(this)
            .attr("name")+" "+d3.select(this).attr("state"))
            .style("left",(e.pageX+20)+"px")
            .style("top",e.pageY+"px")
            .style("visibility","visible")

            var thisId = d3.select(this).attr("county")
            var thisData = byCounty[thisId]

            var table = d3.select("#label").append("div").append("table")
            var headers = ["year","republican","republicanP","democrat","democratP","total","rMinusD"]
            var countHeaders = ["republican","democrat","total"]
            var tr = table.append("tr")
            tr.html("<td>"+headers.join("</td><td>")+"</td>")

            for(var i in thisData){
                table.append("tr")
                tr = table.append("tr")
                var newTrHtml = "<td>"

                for(var h in headers){
                    var hKey = headers[h]
                    var hValue = thisData[i][hKey]
                    if(countHeaders.indexOf(hKey)>-1){
                        if(hValue>1000){
                            hValue=Math.round(hValue/1000)+"k"
                        }
                    }
                    if(hKey=="rMinusD"){
                        newTrHtml+="<b>"+hValue+"</b>"
                    }else{
                        newTrHtml+=hValue

                    }
                    newTrHtml+="</td><td>"
                }
                newTrHtml+="</td>"
                tr.html(newTrHtml)
            }          
        })
        .on("mouseout",function(e,d){
            d3.selectAll(".yearLabels").remove()
            d3.select(this).attr("opacity",.3)
            d3.select("#label").style("visibility","hidden")

        })
    }

       
}


//     svg.selectAll('.lines')
//     .data(Object.values(byState))
//     .enter()
//     .append("path")
//     .attr("class","lines")
//     .attr("d",
//         d3.line()
//         .y(function(d){console.log(d); return d.year})
//         .x(function(d){return d.rMinusD})
//         (d.values)
// )
})


function formatByState(countyData){
    var formatted = {}

    for(var i in countyData){
        var countyFips = String(countyData[i]["county_fips"])
        var state = countyData[i]["state"]
        var year = countyData[i]["year"]
        var votes = parseInt(countyData[i]["candidatevotes"])
        var party = countyData[i]["party"]
        var total = parseInt(countyData[i].totalvotes)
     //   console.log(votes)

        if(countyFips !="undefined" &&countyFips != "NA"){
            if(Object.keys(formatted).indexOf(countyFips)>-1){
                if(Object.keys(formatted[countyFips]).indexOf("total")>-1){
                    formatted[countyFips]["total"][year]=total
                }else{
                    formatted[countyFips]["total"]={}
                    formatted[countyFips]["total"][year]=total
                }

                if(Object.keys(formatted[countyFips]).indexOf(party)>-1){
                
                    if(Object.keys(formatted[countyFips][party]).indexOf(year)>-1){
                        formatted[countyFips][party][year]+=votes

                    }else{
                        formatted[countyFips][party][year]=votes
                    }

                }else{
                    formatted[countyFips][party]={}
                    formatted[countyFips][party][year]=votes
                }
            }else{
                formatted[countyFips]={}
                formatted[countyFips]["fips"]=countyFips
                formatted[countyFips]["name"]=countyData[i]["county_name"]
                formatted[countyFips]["state"]=countyData[i].state
                //formatted[countyFips]["totalVotes"]=countyData[i].totalvotes
                formatted[countyFips][party]={}
                formatted[countyFips][party][year]=votes
            }
        }       
    }
    console.log(formatted)
    

var difference = {}
var years = [2000,2004,2008,2012,2016,2020]

for(var f in formatted){
        difference[f] = []

    years.forEach(function(d){
        if(formatted[f]["DEMOCRAT"]!=undefined){
            var dVotes = parseInt(formatted[f]["DEMOCRAT"][d])
            var rVotes = parseInt(formatted[f]["REPUBLICAN"][d])
            var total = formatted[f]["total"][d]
            var rMinusD = Math.round((rVotes-dVotes)/(total)*10000)/100
            //console.log(f,d,dVotes,rVotes,difference)
            if(total==0){
                rMinusD=0
            }else{
                difference[f].push({democrat:dVotes, democratP:Math.round(dVotes/total*100)+"%", republicanP:Math.round(rVotes/total*100)+"%",republican:rVotes,year:d,rMinusD:rMinusD,total:total,county:f,name:formatted[f]["name"],state:formatted[f]["state"]})
            }
        }
    })
}
var byState = {}
for(var i in difference){
    var state = difference[i][0].state
    if(Object.keys(byState).indexOf(state)>-1){
        byState[state].push(difference[i])
    }else{
        byState[state]=[]
        byState[state].push(difference[i])
    }
}
    return byState
}