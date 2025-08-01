document.addEventListener('DOMContentLoaded', () => {
    // Pega os elementos do HTML
    const projectContainer = document.getElementById('project-container');
    const searchInput = document.getElementById('searchInput');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const timeFilter = document.getElementById('timeFilter');

    let allProjects = []; // Variável para armazenar todos os projetos carregados

    // Função para buscar os dados do arquivo JSON
    fetch('projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            allProjects = data.filter(p => p['Nome do Projeto']); // Armazena os dados e filtra os vazios
            // Depois que os dados são carregados, inicia a página
            populateFilters();
            renderProjects(allProjects);
        })
        .catch(error => {
            console.error('Erro ao carregar o arquivo de projetos:', error);
            projectContainer.innerHTML = '<p>Não foi possível carregar os projetos. Verifique o console para mais detalhes.</p>';
        });

    function renderProjects(projects) {
        projectContainer.innerHTML = '';
        if (projects.length === 0) {
            projectContainer.innerHTML = '<p>Nenhum projeto encontrado para os filtros selecionados.</p>';
            return;
        }

        projects.forEach(project => {
            let projectLink = project['Link do Projeto'] || '#';
            if (projectLink && projectLink !== '#' && !projectLink.startsWith('http')) {
                projectLink = 'http://' + projectLink;
            }

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h2>${project['Nome do Projeto'] || 'Projeto sem nome'}</h2>
                <div class="details">
                    <p>${project['Breve Descrição'] || 'Sem descrição.'}</p>
                    <p><strong>Tecnologias:</strong> ${project['Tecnologias/Materiais'] || 'Não especificado'}</p>
                    <span>Nível: ${project['Nível'] || 'Não especificado'}</span>
                    <span>Tempo: ${project['Tempo de Execução'] || 'Não especificado'}</span>
                </div>
                <a href="${projectLink}" target="_blank">Ver Projeto</a>
            `;
            projectContainer.appendChild(card);
        });
    }

    function populateFilters() {
        const difficulties = [...new Set(allProjects.map(p => p['Nível']).filter(n => n))];
        const times = [...new Set(allProjects.map(p => p['Tempo de Execução']).filter(t => t))];

        difficulties.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            difficultyFilter.appendChild(option);
        });

        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeFilter.appendChild(option);
        });
    }

    function filterProjects() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDifficulty = difficultyFilter.value;
        const selectedTime = timeFilter.value;

        let filteredProjects = allProjects;

        if (searchTerm) {
            filteredProjects = filteredProjects.filter(project => {
                const name = (project['Nome do Projeto'] || '').toLowerCase();
                const tech = (project['Tecnologias/Materiais'] || '').toLowerCase();
                const description = (project['Breve Descrição'] || '').toLowerCase();
                return name.includes(searchTerm) || tech.includes(searchTerm) || description.includes(searchTerm);
            });
        }

        if (selectedDifficulty !== 'all') {
            filteredProjects = filteredProjects.filter(project => project['Nível'] === selectedDifficulty);
        }

        if (selectedTime !== 'all') {
            filteredProjects = filteredProjects.filter(project => project['Tempo de Execução'] === selectedTime);
        }

        renderProjects(filteredProjects);
    }

    // Adiciona os "escutadores" de eventos para todos os filtros
    searchInput.addEventListener('input', filterProjects);
    difficultyFilter.addEventListener('change', filterProjects);
    timeFilter.addEventListener('change', filterProjects);
});