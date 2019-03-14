function initMap() {
    d3.json('lip-data.json').then(lipData => {
        const mapCenter = getMapCenter(lipData);
        const map = openMapAtCenterPoint(mapCenter);
        lipData.forEach(s => createMarkerForSample(map, s));

        drawApplicationChart(lipData);
        drawYieldChart(lipData);
    });
}

function getMapCenter(samples) {
    const numSamples = samples.length;
    const avgLat = samples.reduce((acc, s) => acc + s.sampleLat, 0) / numSamples;
    const avgLon = samples.reduce((acc, s) => acc + s.sampleLon, 0) / numSamples;
    return {
        lat: avgLat,
        lng: avgLon
    };
}

function openMapAtCenterPoint(centerPoint) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: centerPoint,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    return map;
}

function createMarkerForSample(map, sample) {
    var marker = new google.maps.Marker({
        position: {
            lat: sample.sampleLat,
            lng: sample.sampleLon
        },
        map: map,
        title: sample.sampleName,
        label: sample.sampleName
    });

    var sampleInfoWindow = createInfoWindowForSample(sample);
    marker.addListener('click', () => {
        sampleInfoWindow.open(map, marker);
    });

    return marker;
}

function createInfoWindowForSample(sample) {
    return new google.maps.InfoWindow({
        content: '<b>' + sample.sampleName + '</b><br>' +
            '2013 P level: ' + sample.p_2013 + '<br>' +
            '2013 P rec: ' + sample.p_rec_2013 + '<br>' +
            '2013 P removal: ' + sample.p_removal_2013
    });
}

function drawApplicationChart(samples) {
    const chartMargin = {
        top: 0,
        right: 0,
        bottom: 19,
        left: 60
    };

    const chartWidth = 1200 + chartMargin.left + chartMargin.right;
    const chartHeight = d3.max(samples, s => s.p_2013 + s.p_rec_2013) + chartMargin.top + chartMargin.bottom;
    const applicationChartWrapper = d3.select('#full-field-charts').append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight);

    const applicationChart = applicationChartWrapper.append('g')
        .attr('transform', 'translate(' + chartMargin.left + ', ' + chartMargin.right + ')');

    const bars = applicationChart.selectAll('rect')
        .data(samples);

    const x = d3.scaleBand()
        .domain(samples.map(s => s.sampleName))
        .range([0, chartWidth - chartMargin.left - chartMargin.right])
        .paddingInner(0.3)
        .paddingOuter(0);

    const xAxis = d3.axisBottom(x);
    applicationChart.append('g')
        .attr('transform', 'translate(0, ' + (chartHeight - chartMargin.bottom) + ')')
        .call(xAxis);

    const y = d3.scaleLinear()
        .domain([0, d3.max(samples.map(s => s.p_2013 + s.p_rec_2013))])
        .range([d3.max(samples.map(s => s.p_2013 + s.p_rec_2013)), 0]);

    const yAxis = d3.axisLeft(y);
    applicationChart.append('g')
        .call(yAxis);

    // soil test P
    bars.enter()
        .append('rect')
        .attr('x', s => x(s.sampleName))
        .attr('y', s => y(s.p_2013))
        .attr('width', x.bandwidth)
        .attr('height', s => s.p_2013)
        .attr('fill', 'green');

    // applied P
    bars.enter()
        .append('rect')
        .attr('x', s => x(s.sampleName))
        .attr('y', s => y(s.p_2013 + s.p_rec_2013))
        .attr('width', x.bandwidth)
        .attr('height', s => s.p_rec_2013)
        .attr('fill', 'gold');
}

function drawYieldChart(samples) {
    const chartMargin = {
        top: 4,
        right: 0,
        bottom: 0,
        left: 60
    };

    const chartWidth = 1200 + chartMargin.left + chartMargin.right;
    const chartHeight = d3.max(samples, s => s.p_removal_2013) + chartMargin.top + chartMargin.bottom;
    const yieldChartWrapper = d3.select('#full-field-charts').append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight);

    const yieldChart = yieldChartWrapper.append('g')
        .attr('transform', 'translate(' + chartMargin.left + ', ' + chartMargin.right + ')');

    const x = d3.scaleBand()
        .domain(samples.map(s => s.sampleName))
        .range([0, chartWidth - chartMargin.left - chartMargin.right])
        .paddingInner(0.3)
        .paddingOuter(0);

    const xAxis = d3.axisTop(x)
        .tickFormat('');
    yieldChart.append('g')
        .attr('transform', 'translate(0, ' + chartMargin.top + ')')
        .call(xAxis);


    const y = d3.scaleLinear()
        .domain([0, d3.max(samples, s => s.p_removal_2013)])
        .range([0, d3.max(samples, s => s.p_removal_2013)]);
    const yAxis = d3.axisLeft(y)
        .tickValues([0, 20, 40, 60, 80]);
    yieldChart.append('g')
        .call(yAxis)
        .attr('transform', 'translate(0, ' + chartMargin.top + ')');

    const bars = yieldChart.selectAll('rect')
        .data(samples);

    // removed P
    bars.enter()
        .append('rect')
        .attr('x', s => x(s.sampleName))
        .attr('y', chartMargin.top)
        .attr('width', x.bandwidth)
        .attr('height', s => s.p_removal_2013)
        .attr('fill', 'palevioletred');
}