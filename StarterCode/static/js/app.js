// Create a horizontal bar chart with a dropdown menu to 
// display the top 10 OTUs found in that individual.

// Use sample_values as the values for the bar chart.
// Use otu_ids as the labels for the bar chart.
// Use otu_labels as the hovertext for the chart.

// URL to fetch data
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Fetch data and populate the dropdown menu    
d3.json(url).then(data => {
    const names = data.names;
    populateDropdown(names);
});


// Function to populate the dropdown menu with IDs
function populateDropdown(names) {
    let dropdownMenu = d3.select("#selDataset");
    names.forEach(name => {
        dropdownMenu.append("option").text(name).property("value", name);
    })
};

// Fetch the data and plot the chart for the first individual

function init() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.samples.length > 0) {
                const firstSample = data.samples[0];

                // Extracting data for Bar Chart
                let topOTUs = firstSample.otu_ids.slice(0, 10);
                let topSampleValues = firstSample.sample_values.slice(0, 10);
                let topOTULabels = firstSample.otu_labels.slice(0, 10);

                plotBarChart(topOTUs, topSampleValues, topOTULabels);

                // Extracting data for Bubble Chart
                plotBubbleChart(firstSample.otu_ids, firstSample.sample_values, firstSample.otu_labels);

                // Extracting data for Metadata
                const firstMetadata = data.metadata[0];
                displayMetadata(firstMetadata);

                // Extracting data for Gauge Chart
                plotGaugeChart(firstMetadata.wfreq);
            }
        });
}

// Event handler for the dropdown menu
d3.selectAll("#selDataset").on("change", updateChart);

// Function to update the chart when a new individual is selected
function updateChart() {
    let selectedID = d3.select("#selDataset").node().value; 

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const individualSample = data.samples.find(sample => sample.id === selectedID);
            
            // Extracting data for Bar Chart
            let topOTUs = individualSample.otu_ids.slice(0, 10);
            let topSampleValues = individualSample.sample_values.slice(0, 10);
            let topOTULabels = individualSample.otu_labels.slice(0, 10);

            plotBarChart(topOTUs, topSampleValues, topOTULabels);

            // Extracting data for Bubble Chart
            let otuIds = individualSample.otu_ids;
            let sampleValues = individualSample.sample_values;
            let otuLabels = individualSample.otu_labels;

            plotBubbleChart(otuIds, sampleValues, otuLabels);

            const individualMetadata = data.metadata.find(meta => meta.id == selectedID);
            displayMetadata(individualMetadata);

            const wfreq = individualMetadata.wfreq;

            plotGaugeChart(wfreq);

        }); 
}
    
// Function to plot the bar chart with top 10 OTUs for a given individual

function plotBarChart(otuIds, sampleValues, otuLabels) {
    let trace = {
        x: sampleValues.reverse(),
        y: otuIds.map(id => `OTU ${id}`),
        text: otuLabels,
        type: 'bar',
        orientation: 'h'
    };

    let layout = {
        title: 'Top 10 OTUs',
        xaxis: { title: 'Sample Values' },
        yaxis: { title: 'OTU IDs' },
        width: 600,
        height: 400,

    };

    Plotly.newPlot('bar', [trace], layout);
}

// Function to create the bubble chart for the given individual

function plotBubbleChart(otuIds, sampleValues, otuLabels) {
    let trace = {
        x: otuIds,
        y: sampleValues,
        text: otuLabels,
        mode: 'markers',
        marker: {
            size: sampleValues,
            color: otuIds,
            colorscale: 'Earth' 
        }
    };

    let data = [trace];

    let layout = {
        title: 'OTU Bubble Chart',
        xaxis: { title: 'OTU ID' },
        yaxis: { title: 'Sample Values' },
        showlegend: false,
        width: 1000 ,
        height: 600,
     
    };

    Plotly.newPlot('bubble', data, layout);
}

// Function to display the metadata for the given individual
function displayMetadata(metadata) {
    let metadataPanel = d3.select("#sample-metadata");
    metadataPanel.html(""); 

    Object.entries(metadata).forEach(([key, value]) => {
        metadataPanel.append("h5").text(`${key}: ${value}`);
    });
}

// Function to display the gauge 

function plotGaugeChart(wfreq) {
    let colors = ['#F8F3EC', '#F4F1E4', '#E9E6CA', '#E2E4B1', '#D5E49D', '#B7CC92', '#8CBF88', '#8ABB8F', '#85B48A', '#82B284']; // Custom colors for each step
    let steps = colors.map((color, index) => {
        return { range: [index, index + 1], color: color };
    });

    let data = [
        {
            type: "indicator",
            mode: "gauge+number",
            value: wfreq,
            title: { text: "Belly Button Washing Frequency<br>Scrubs per Week" },
            gauge: {
                axis: { range: [null, 9], tickwidth: 2, tickcolor: "black" },
                bar: { color: "grey" },
                steps: steps,
                threshold: {
                    line: { color: "red", width: 4 },
                    thickness: 0.75,
                    value: wfreq
                }
            }
        }
    ];

    let layout = {
        width: 400,
        height: 600
        
         };

    Plotly.newPlot('gauge', data, layout);
}



init(); 