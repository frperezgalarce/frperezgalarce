document.addEventListener('DOMContentLoaded', function () {
    const graph = document.getElementById('collaboration-graph');
    if (!graph) return;

    const me = 'Francisco Pérez-Galarce';
    const topics = {
        health: { label: 'Health & survival', color: '#252525', x: 245, y: 220, rx: 210, ry: 175 },
        astronomy: { label: 'Astronomy & ML', color: '#494949', x: 940, y: 205, rx: 205, ry: 160 },
        optimization: { label: 'Optimization & networks', color: '#686868', x: 255, y: 660, rx: 225, ry: 175 },
        analytics: { label: 'Applied analytics', color: '#858585', x: 670, y: 690, rx: 205, ry: 145 },
        education: { label: 'Education & social networks', color: '#a3a3a3', x: 980, y: 620, rx: 185, ry: 170 }
    };

    // Every entry corresponds to one journal paper, conference contribution, or preprint below.
    const publications = [
        { topic: 'education', authors: ['Alfredo Candia-Véjar', 'Álvaro Faúndez', 'Camila Rojas', 'Isidora Jeria', 'Natacha Benítez', 'María Ignacia Tupper', 'Romina Inostroza', 'Etienne Bellenger', me] },
        { topic: 'health', authors: ['Fernando Montenegro-Dos Santos', me, 'Carlos Monardes-Concha', 'Sergio Cruz-Zárate', 'Alfredo Candia-Véjar'] },
        { topic: 'astronomy', authors: [me, 'Javier Martinez-Palomera', 'Karlo Pichara', 'Pablo Huijse', 'Márcio Catelan'] },
        { topic: 'health', authors: ['Joris Van de Klundert', me, 'Mauricio Olivares', 'Laura Pengel', 'A. de Weerd'] },
        { topic: 'health', authors: ['Joris Van de Klundert', 'H. De Vries', me, 'N. Valdes', 'Felipe Simon'] },
        { topic: 'optimization', authors: ['Claudia Sotelo', 'R. Santa-Gonzalez', me, 'Carlos Monardes-Concha'] },
        { topic: 'analytics', authors: ['Fernando Montenegro-Dos Santos', me, 'Carlos Monardes-Concha', 'Alfredo Candia-Véjar', 'M. Nagano'] },
        { topic: 'astronomy', authors: [me, 'Karlo Pichara', 'Pablo Huijse', 'Márcio Catelan', 'Domingo Mery'] },
        { topic: 'astronomy', authors: ['Yennifer Salinas', 'Karlo Pichara', 'Rodrigo Brahm', me, 'Domingo Mery'] },
        { topic: 'analytics', authors: ['José Moya', me, 'C. Tamarasco', 'Claudio Astudillo', 'Alfredo Candia-Véjar'] },
        { topic: 'optimization', authors: ['Zulema Govea', me, 'Alfredo Candia-Véjar'] },
        { topic: 'astronomy', authors: [me, 'Karlo Pichara', 'Pablo Huijse', 'Márcio Catelan', 'Domingo Mery'] },
        { topic: 'optimization', authors: [me, 'Nelson Maculan', 'Alfredo Candia-Véjar'] },
        { topic: 'optimization', authors: ['Diego Revillot', me, 'Eduardo Álvarez-Miranda'] },
        { topic: 'optimization', authors: [me, 'Alfredo Candia-Véjar', 'Claudio Astudillo', 'M. Bardeen'] },
        { topic: 'optimization', authors: [me, 'L. J. Canales', 'C. Vergara', 'Alfredo Candia-Véjar'] },
        { topic: 'analytics', authors: ['C. Herrera-Cáceres', me, 'Eduardo Álvarez-Miranda', 'Alfredo Candia-Véjar'] },
        { topic: 'optimization', authors: [me, 'Eduardo Álvarez-Miranda', 'Alfredo Candia-Véjar', 'Paolo Toth'] },
        { topic: 'optimization', authors: ['Eduardo Álvarez-Miranda', 'Alfredo Candia-Véjar', 'Emilio Carrizosa', me] },
        { topic: 'health', authors: ['Bart Smeulders', 'Luis Olivares-Álvarez', me, 'Joris Van de Klundert'] },
        { topic: 'health', authors: ['Joris Van de Klundert', me, 'Felipe Simon', 'Luis Olivares-Álvarez'] },
        { topic: 'health', authors: ['Joris Van de Klundert', 'Valentina Peralta Clarke', me, 'Felipe Simon'] },
        { topic: 'health', authors: ['Valentina Peralta Clarke', 'Hans de Ferrante', me, 'Joris Van de Klundert'] },
        { topic: 'health', authors: ['Valentina Peralta Clarke', 'Hans de Ferrante', me, 'Joris Van de Klundert'] },
        { topic: 'health', authors: ['Felipe Simon', me, 'Joris Van de Klundert'] }
    ];

    const people = new Map();
    const ties = new Map();
    publications.forEach((publication, publicationIndex) => {
        publication.authors.forEach(name => {
            if (!people.has(name)) people.set(name, { name, count: 0, topics: new Set(), works: new Set() });
            const person = people.get(name);
            person.count += 1;
            person.topics.add(publication.topic);
            person.works.add(publicationIndex);
        });
        for (let i = 0; i < publication.authors.length; i += 1) {
            for (let j = i + 1; j < publication.authors.length; j += 1) {
                const pair = [publication.authors[i], publication.authors[j]].sort();
                const key = pair.join('|||');
                if (!ties.has(key)) ties.set(key, { source: pair[0], target: pair[1], weight: 0, topics: new Set() });
                const tie = ties.get(key);
                tie.weight += 1;
                tie.topics.add(publication.topic);
            }
        }
    });

    const collaborators = [...people.values()].filter(person => person.name !== me);
    const positions = buildPositions(collaborators);
    positions.set(me, { x: 600, y: 430 });
    const filters = document.getElementById('topic-filters');
    addFilter('all', { label: 'All topics', color: '#111111' });
    Object.entries(topics).forEach(([key, topic]) => addFilter(key, topic));

    const regionLayer = svgElement('g', { class: 'network-regions' });
    const edgeLayer = svgElement('g', { class: 'coauthor-edges' });
    const nodeLayer = svgElement('g', { class: 'coauthor-nodes' });
    graph.append(regionLayer, edgeLayer, nodeLayer);

    Object.entries(topics).forEach(([key, topic]) => {
        const region = svgElement('ellipse', { cx: topic.x, cy: topic.y, rx: topic.rx, ry: topic.ry, class: 'topic-region' });
        region.dataset.topic = key;
        region.style.setProperty('--region-color', topic.color);
        const label = svgElement('text', { x: topic.x, y: topic.y - topic.ry + 28, class: 'topic-region-label', 'text-anchor': 'middle' });
        label.dataset.topic = key;
        label.style.setProperty('--region-color', topic.color);
        label.textContent = topic.label;
        regionLayer.append(region, label);
    });

    ties.forEach(tie => {
        const from = positions.get(tie.source);
        const to = positions.get(tie.target);
        const edge = svgElement('line', { x1: from.x, y1: from.y, x2: to.x, y2: to.y, class: 'coauthor-edge' });
        edge.dataset.source = tie.source;
        edge.dataset.target = tie.target;
        edge.dataset.topics = [...tie.topics].join(' ');
        edge.setAttribute('stroke-width', Math.min(0.7 + tie.weight * 0.65, 4));
        edgeLayer.appendChild(edge);
    });

    people.forEach(person => nodeLayer.appendChild(createNode(person, positions.get(person.name))));

    function buildPositions(collaboratorList) {
        const result = new Map();
        const singles = {};
        Object.keys(topics).forEach(key => singles[key] = collaboratorList.filter(person => person.topics.size === 1 && person.topics.has(key)));
        Object.entries(singles).forEach(([key, group]) => {
            const topic = topics[key];
            group.forEach((person, index) => {
                const ring = group.length > 9 && index % 2 ? 132 : 92;
                const count = group.length > 9 ? Math.ceil(group.length / 2) : group.length;
                const angle = (Math.PI * 2 * Math.floor(index / (group.length > 9 ? 2 : 1)) / Math.max(count, 1)) - Math.PI / 2 + (ring === 132 ? 0.25 : 0);
                result.set(person.name, { x: topic.x + Math.cos(angle) * ring, y: topic.y + Math.sin(angle) * ring });
            });
        });
        collaboratorList.filter(person => person.topics.size > 1).forEach((person, index) => {
            const memberships = [...person.topics].map(key => topics[key]);
            const x = memberships.reduce((sum, topic) => sum + topic.x, 0) / memberships.length;
            const y = memberships.reduce((sum, topic) => sum + topic.y, 0) / memberships.length;
            const angle = index * 2.399;
            result.set(person.name, { x: x + Math.cos(angle) * 48, y: y + Math.sin(angle) * 48 });
        });
        return result;
    }

    function createNode(person, position) {
        const isMe = person.name === me;
        const primaryTopic = [...person.topics][0];
        const group = svgElement('g', { class: `coauthor-node${isMe ? ' central-author' : ''}${person.topics.size > 1 ? ' cross-topic' : ''}`, transform: `translate(${position.x} ${position.y})`, tabindex: isMe ? '-1' : '0', role: isMe ? 'img' : 'button', 'aria-label': isMe ? `${me}, central author` : `${person.name}, ${person.count} shared ${person.count === 1 ? 'work' : 'works'}` });
        group.dataset.name = person.name;
        group.dataset.topics = [...person.topics].join(' ');
        group.style.setProperty('--node-color', isMe ? '#17202a' : topics[primaryTopic].color);
        const radius = isMe ? 37 : 7 + Math.sqrt(person.count) * 3.8;
        group.appendChild(svgElement('circle', { r: radius }));
        const label = svgElement('text', { y: radius + 14, 'text-anchor': 'middle' });
        label.textContent = isMe ? 'Francisco Pérez-Galarce' : shortName(person.name);
        group.appendChild(label);
        if (!isMe) {
            group.addEventListener('click', () => selectPerson(person));
            group.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectPerson(person);
                }
            });
        }
        return group;
    }

    function shortName(name) {
        const known = {
            'Joris Van de Klundert': 'Van de Klundert',
            'Valentina Peralta Clarke': 'Peralta Clarke',
            'Luis Olivares-Álvarez': 'Olivares-Álvarez',
            'Fernando Montenegro-Dos Santos': 'Montenegro',
            'Carlos Monardes-Concha': 'Monardes',
            'Eduardo Álvarez-Miranda': 'Álvarez-Miranda',
            'María Ignacia Tupper': 'Tupper'
        };
        return known[name] || name.replace(/^[A-Z]\.?\s+/, '').split(' ').slice(-1)[0];
    }

    function addFilter(key, topic) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'topic-filter';
        button.textContent = topic.label;
        button.dataset.topic = key;
        button.style.setProperty('--topic-color', topic.color);
        button.setAttribute('aria-pressed', key === 'all' ? 'true' : 'false');
        button.addEventListener('click', () => filterTopic(key));
        filters.appendChild(button);
    }

    function filterTopic(key) {
        filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === key)));
        graph.querySelectorAll('.topic-region, .topic-region-label').forEach(element => element.classList.toggle('is-muted', key !== 'all' && element.dataset.topic !== key));
        graph.querySelectorAll('.coauthor-node:not(.central-author)').forEach(node => node.classList.toggle('is-muted', key !== 'all' && !node.dataset.topics.split(' ').includes(key)));
        graph.querySelectorAll('.coauthor-edge').forEach(edge => edge.classList.toggle('is-muted', key !== 'all' && !edge.dataset.topics.split(' ').includes(key)));
        const visiblePeople = collaborators.filter(person => key === 'all' || person.topics.has(key));
        const visibleTies = [...ties.values()].filter(tie => key === 'all' || tie.topics.has(key));
        updateStats(visiblePeople.length, visibleTies.length);
        document.getElementById('collaborator-detail').innerHTML = `<p class="detail-kicker">Selected network</p><h3>${key === 'all' ? 'All topics' : topics[key].label}</h3><p>${visiblePeople.length} collaborators and ${visibleTies.length} coauthor ties are visible. Select a researcher to isolate their direct collaboration neighborhood.</p>`;
    }

    function selectPerson(person) {
        const neighbors = new Set([person.name]);
        let directTies = 0;
        graph.querySelectorAll('.coauthor-edge').forEach(edge => {
            const connected = edge.dataset.source === person.name || edge.dataset.target === person.name;
            edge.classList.toggle('is-muted', !connected);
            edge.classList.toggle('is-selected', connected);
            if (connected) {
                directTies += 1;
                neighbors.add(edge.dataset.source);
                neighbors.add(edge.dataset.target);
            }
        });
        graph.querySelectorAll('.coauthor-node').forEach(node => {
            node.classList.toggle('is-muted', !neighbors.has(node.dataset.name));
            node.classList.toggle('is-selected', node.dataset.name === person.name);
        });
        const topicBadges = [...person.topics].map(key => `<span class="detail-topic" style="background:${topics[key].color}">${topics[key].label}</span>`).join('');
        document.getElementById('collaborator-detail').innerHTML = `<p class="detail-kicker">Collaboration neighborhood</p><h3>${person.name}</h3><p><strong>${person.count}</strong> shared ${person.count === 1 ? 'work' : 'works'} with Francisco and <strong>${directTies}</strong> direct coauthor ties in this network.</p><div class="detail-topics">${topicBadges}</div><button type="button" class="reset-network" id="reset-network">Show complete network</button>`;
        document.getElementById('reset-network').addEventListener('click', () => filterTopic('all'));
    }

    function updateStats(collaboratorCount, tieCount) {
        document.getElementById('collaborator-count').textContent = collaboratorCount;
        document.getElementById('connection-count').textContent = tieCount;
    }

    function svgElement(tag, attributes) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        return element;
    }

    filterTopic('all');
});
