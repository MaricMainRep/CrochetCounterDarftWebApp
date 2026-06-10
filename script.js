/* ======================================================
    CROCHET COUNTER V2
    PART 1 - DATA, STORAGE, RENDERING
   ====================================================== */

/* ======================================================
    GLOBAL STATE
   ====================================================== */

let projects = [];

let currentProjectId = null;
let currentSectionId = null;
let renamingSectionId = null;
let renamingProjectId = null;

/* ======================================================
    STORAGE
   ====================================================== */

const STORAGE_KEY = "crochet-counter-v2";

/* ======================================================
    LOAD APP
   ====================================================== */

function loadApp() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (saved) {

        projects =
            JSON.parse(saved);

    } else {

        createDemoData();
    }

    renderProjects();

    loadSelectedSection();
}

/* ======================================================
    SAVE APP
   ====================================================== */

function saveApp() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(projects)
    );
}

/* ======================================================
    DEMO DATA
   ====================================================== */

function createDemoData() {

    projects = [];

    currentProjectId = null;

    currentSectionId = null;
}

/* ======================================================
    HELPERS
   ====================================================== */

function getCurrentProject() {

    return projects.find(
        project =>
            project.id ===
            currentProjectId
    );
}

function getCurrentSection() {

    const project =
        getCurrentProject();

    if (!project) {

        return null;
    }

    return project.sections.find(
        section =>
            section.id ===
            currentSectionId
    );
}

/* ======================================================
    PROJECT PROGRESS
   ====================================================== */

function calculateProjectProgress(
    project
) {

    if (
        project.sections.length === 0
    ) {

        return 0;
    }

    const completed =
        project.sections.filter(
            section =>
                section.completed
        ).length;

    return Math.round(
        (
            completed /
            project.sections.length
        ) * 100
    );
}

/* ======================================================
    COLLAPSIBLE SIDEBAR
====================================================== */

const sidebar =
    document.querySelector(
        ".sidebar"
    );

const toggleSidebarBtn =
    document.getElementById(
        "toggleSidebarBtn"
    );

const instructionsCard =
    document.querySelector(
        ".instructions-card"
    );

const toggleInstructionsBtn =
    document.getElementById(
        "toggleInstructionsBtn"
    );

toggleSidebarBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "collapsed"
        );
    }
);

toggleInstructionsBtn.addEventListener(
    "click",
    () => {

        instructionsCard.classList.toggle(
            "collapsed"
        );

    }
);

/* ======================================================
    SIDEBAR RENDER
   ====================================================== */

function renderProjects() {

    const container =
        document.getElementById(
            "projectList"
        );

    container.innerHTML = "";

    /* ==========================
    EMPTY STATE
========================== */

if (
    projects.length === 0
) {

    container.innerHTML = `

        <div class="empty-state">

            <h3>
                No Projects Yet
            </h3>

            <p>
                Create your first crochet project.
            </p>

        </div>

    `;

    return;
}

    projects.forEach(project => {

        const progress =
            calculateProjectProgress(
                project
            );

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "project-card";

        let sectionsHTML = "";

        if (
            project.expanded
        ) {

            project.sections.forEach(
                section => {

                let icon = "○";

                if (
                    section.completed
                ) {

                    icon = "✓";
                }

                if (
                    section.id ===
                    currentSectionId
                ) {

                    icon = "●";
                }

                sectionsHTML += `
                    <div class="section-row">
                        
                        <div 
                            class="section-item" 
                            onclick="selectSection('${project.id}','${section.id}')"
                        >
                            ${icon}
                            ${section.name}
                            [${section.current}/${section.target}]
                        </div>
                    
                        <button class="rename-section-btn"
                            onclick="event.stopPropagation();
                            renameSection('${section.id}');">
                            ✏
                        </button>
                    </div>
                `;
            });

            sectionsHTML += `
                <button
                    class="add-section-btn"
                    onclick="openSectionModal('${project.id}')"
                >
                    + Add Section
                </button>
            `;
        }

        card.innerHTML = `
            <div class="project-title-row">

    <div
        class="project-title"
        onclick="toggleProject('${project.id}')"
    >
        ${project.expanded ? "▼" : "▶"}
        ${project.name}
    </div>

    <div class="project-actions">

        <button
            class="rename-project-btn"
            onclick="
                event.stopPropagation();
                renameProject('${project.id}');
            "
        >
            ✏
        </button>

        <button
            class="delete-project-btn"
            onclick="
                event.stopPropagation();
                deleteProject('${project.id}');
            "
        >
            🗑
        </button>

    </div>

</div>

            <div
                class="project-progress"
            >
                <div
                    class="progress-track"
                >
                    <div
                        class="progress-fill"
                        style="
                            width:${progress}%
                        "
                    >
                    </div>
                </div>

                <div
                    class="project-percent"
                >
                    ${progress}% Complete
                </div>
            </div>

            <div
                class="sections"
            >
                ${sectionsHTML}
            </div>
        `;

        container.appendChild(
            card
        );
    });

    saveApp();
}

/* ======================================================
    PROJECT ACTIONS
   ====================================================== */

function toggleProject(
    projectId
) {

    const project =
        projects.find(
            p =>
                p.id ===
                projectId
        );

    project.expanded =
        !project.expanded;

    renderProjects();
}

function deleteProject(
    projectId
){

    const project =
        projects.find(
            p =>
            p.id === projectId
        );

    if(!project){
        return;
    }

    const confirmed =
        confirm(
            `Delete "${project.name}"?`
        );

    if(!confirmed){
        return;
    }

    projects =
        projects.filter(
            p =>
            p.id !== projectId
        );

    if(projects.length === 0){

        currentProjectId = null;
        currentSectionId = null;

    } else {

        currentProjectId =
            projects[0].id;

        currentSectionId =
            projects[0]
            .sections[0]
            .id;
    }

    renderProjects();
    saveApp();
}

function renameProject(
    projectId
){
    const project = projects.find(
        p => p.id === projectId
    );

    if (
        !project
    ){
        return;
    }

    renamingProjectId = projectId;

    document.getElementById("renameProjectInput")
    .value = project.name;

    showModal(
        "renameProjectModal"
    );

    setTimeout(
        () => {
            document.getElementById(
                "renameProjectInput"
            )
            .focus();
        },
        50
    );
}

function renameSection(
    sectionId
){
    let section = null;

    for ( 
        const project of projects 
    ){
        const found = project.sections.find(
            s => s.id === sectionId
        );

        if (found){

            section = found;

            break;
        }
    }

    if (
        !section
    ){
        return;
    }

    renamingSectionId = sectionId;

    document.getElementById("renameSectionInput")
    .value = section.name;

    showModal(
        "renameSectionModal"
    );
}

function selectSection(
    projectId,
    sectionId
) {

    currentProjectId =
        projectId;

    currentSectionId =
        sectionId;

    renderProjects();

    loadSelectedSection();
}

document.getElementById(
    "saveRenameSectionBtn"
)
.addEventListener(
    "click",
    () => {
        const newName = document.getElementById(
            "renameSectionInput"
        )
        .value
        .trim();

        if (
            !newName
        ){
            return;
        }

        for(
            const project of projects
        ){
            const section = project.sections.find(
                s => s.id === renamingSectionId
            );

            if ( 
                section
            ){
                section.name = newName;

                break;
            }
        }

        renderProjects();

        loadSelectedSection();
        
        saveApp();

        hideModal(
            "renameSectionModal"
        );
    }
);


document.getElementById(
    "saveRenameProjectBtn"
)
.addEventListener(
    "click",
    () => {
        const newName = document.getElementById(
                "renameProjectInput"
            )
            .value
            .trim();
        
        if (
            !newName
        ){
            return;
        }

        const project = projects.find(
            p => p.id === renamingProjectId
        );

        if (
            !project
        ){
            return;
        }

        project.name = newName;

        renderProjects();

        loadSelectedSection();

        saveApp();

        hideModal(
            "renameProjectModal"
        );

    }
);

/* ======================================================
    MAIN SCREEN
   ====================================================== */

function loadSelectedSection() {

    const project =
        getCurrentProject();

    const section =
        getCurrentSection();

    if (
        !project ||
        !section
    ) {

        return;
    }

    document.getElementById(
        "projectName"
    ).textContent =
        project.name;

    document.getElementById(
        "sectionName"
    ).textContent =
        section.name;

    document.getElementById(
        "currentCount"
    ).textContent =
        section.current;

    document.getElementById(
        "targetCount"
    ).textContent =
        section.target;

    renderInstructions();

    updateProgressRing();
}

/* ======================================================
    INSTRUCTIONS PLACEHOLDER
   ====================================================== */

function renderInstructions() {
    const section = getCurrentSection();
    const list = document.getElementById("instructionList");
    if (
        !section
    ){
        return;
    }

    if (
        !section.instructions
    ){
        list.innerHTML = "No instructions yet.";

        return;
    }

    list.innerHTML = ` 
    <pre class="instruction-text">${section.instructions}</pre>
    `;
}

/* ======================================================
    PROGRESS RING PLACEHOLDER
   ====================================================== */

function updateProgressRing() {

    // PART 2
}

/* ======================================================
    SECTION MODAL PLACEHOLDER
   ====================================================== */

function openSectionModal() {

    // PART 3
}

/* ======================================================
    CONFETTI PLACEHOLDER
   ====================================================== */

function launchConfetti() {

    // PART 4
}

/* ======================================================
    APP START
   ====================================================== */

loadApp();

/* ======================================================
    END OF PART 1
   ====================================================== */

/* ======================================================
    PART 2
    COUNTER LOGIC
    PROGRESS RING
    KEYBOARD CONTROLS
   ====================================================== */

/* ======================================================
    ADD STITCH
   ====================================================== */

function addStitch() {

    const section =
        getCurrentSection();

    if (!section) return;

    if (
        section.current <
        section.target
    ) {

        section.current++;
    }

    if (
    section.current >=
    section.target
) {

    section.current =
        section.target;

    section.completed =
        true;

    launchConfetti();

    setTimeout(
        () => {

            const project =
                getCurrentProject();

            const index =
                project.sections.findIndex(
                    s =>
                    s.id ===
                    section.id
                );

            const nextSection =
                project.sections[
                    index + 1
                ];

            if (
                nextSection
            ){

                currentSectionId =
                    nextSection.id;

                renderProjects();

                loadSelectedSection();
            }

        },
        500
    );
}

    saveApp();

    loadSelectedSection();

    renderProjects();
}

/* ======================================================
    REMOVE STITCH
   ====================================================== */

function removeStitch() {

    const section =
        getCurrentSection();

    if (!section) return;

    if (
        section.current > 0
    ) {

        section.current--;
    }

    if (
        section.current <
        section.target
    ) {

        section.completed =
            false;
    }

    saveApp();

    loadSelectedSection();

    renderProjects();
}

/* ======================================================
    RESET SECTION
   ====================================================== */

function resetCurrentSection() {

    const section =
        getCurrentSection();

    if (!section) return;

    const confirmReset =
        confirm(
            "Reset current section?"
        );

    if (
        !confirmReset
    ) {

        return;
    }

    section.current = 0;

    section.completed =
        false;

    saveApp();

    loadSelectedSection();

    renderProjects();
}

/* ======================================================
    PROGRESS %
   ====================================================== */

function getSectionPercent() {

    const section =
        getCurrentSection();

    if (
        !section
    ) {

        return 0;
    }

    if (
        section.target === 0
    ) {

        return 0;
    }

    return Math.round(

        (
            section.current /
            section.target
        ) * 100

    );
}

/* ======================================================
    PROGRESS RING
   ====================================================== */

function updateProgressRing() {

    const section =
        getCurrentSection();

    if (
        !section
    ) {

        return;
    }

    const percent =
        getSectionPercent();

    const ring =
        document.getElementById(
            "ringProgress"
        );

    const circumference =
        691;

    const offset =

        circumference -

        (
            percent / 100
        ) * circumference;

    ring.style.strokeDashoffset =
        offset;

    document.getElementById(
        "progressPercent"
    ).textContent =
        percent + "%";
}

/* ======================================================
    COUNTER BUTTONS
   ====================================================== */

document
.getElementById(
    "plusBtn"
)
.addEventListener(
    "click",
    addStitch
);

document
.getElementById(
    "minusBtn"
)
.addEventListener(
    "click",
    removeStitch
);

function previousSection(){

    const project =
        getCurrentProject();

    const section =
        getCurrentSection();

    if(
        !project ||
        !section
    ){
        return;
    }

    const index =
        project.sections.findIndex(
            s =>
            s.id === section.id
        );

    if(
        index <= 0
    ){
        return;
    }

    currentSectionId =
        project.sections[
            index - 1
        ].id;

    renderProjects();

    loadSelectedSection();
}

/* ======================================================
    NAVIGATION BUTTONS
   ====================================================== */

document
.getElementById(
    "previousSectionBtn"
)

.addEventListener(
    "click",
    previousSection
);

document
.getElementById(
    "addSectionBtn"
)
.addEventListener(
    "click",
    () => {

        const project =
            getCurrentProject();

        if (
            !project
        ){
            return;
        }

        openSectionModal(
            project.id
        );
    }
);

document
.getElementById(
    "nextSectionBtn"
)
.addEventListener(
    "click",
    () => {

        const project =
            getCurrentProject();

        const section =
            getCurrentSection();

        if (
            !project ||
            !section
        ){
            return;
        }

        const index =
            project.sections.findIndex(
                s =>
                s.id ===
                section.id
            );

        if (
            index === -1
        ){
            return;
        }

        const nextSection =
            project.sections[
                index + 1
            ];

        if (
            !nextSection
        ){
            return;
        }

        currentSectionId =
            nextSection.id;

        renderProjects();

        loadSelectedSection();
    }
);

/* ======================================================
    CLICK RING TO ADD
   ====================================================== */

document
.querySelector(
    ".progress-ring-container"
)
.addEventListener(
    "click",
    addStitch
);

/* ======================================================
    KEYBOARD CONTROLS
   ====================================================== */

document.addEventListener(
    "keydown",
    event => {

        const tag =
            document.activeElement
            .tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA"
        ) {

            return;
        }

        /* -------------------
            +1 Stitch
        ------------------- */

        if (
            event.key ===
            "ArrowRight"
        ) {

            addStitch();
        }

        /* -------------------
            -1 Stitch
        ------------------- */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            removeStitch();
        }

        /* -------------------
            Reset Section
        ------------------- */

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            resetCurrentSection();
        }

        /* -------------------
            Next Section
        ------------------- */

        if(
            event.key ===
            "Enter"
        ){

            event.preventDefault();

        document
        .getElementById(
                "nextSectionBtn"
        )
        .click();

        }   

        /* -------------------
            Previous Section
        ------------------- */
        if(
            event.key ===
            "Backspace"
        ){

            event.preventDefault();

            previousSection();
        }
    }
);

/* ======================================================
    NEXT SECTION PLACEHOLDER
   ====================================================== */

function openNextSectionModal() {

    // PART 3
}

/*
=========================================================
END OF PART 2
=========================================================
*/

/* ======================================================
    PART 3
    MODALS
    PROJECTS
    SECTIONS
   ====================================================== */

/* ======================================================
    MODAL HELPERS
   ====================================================== */

function showModal(id) {

    document
        .getElementById(id)
        .classList
        .remove("hidden");
}

function hideModal(id) {

    document
        .getElementById(id)
        .classList
        .add("hidden");
}

/* ======================================================
    PROJECT MODAL
   ====================================================== */

document
.getElementById(
    "addProjectBtn"
)
.addEventListener(
    "click",
    () => {

        document
        .getElementById(
            "projectNameInput"
        )
        .value = "";

        document
.getElementById(
    "firstSectionInput"
)
.value =
    "Magic Ring";

document
.getElementById(
    "firstTargetInput"
)
.value =
    6;

        showModal(
            "projectModal"
        );
    }
);

/* ======================================================
    CREATE PROJECT
   ====================================================== */

document
.getElementById(
    "createProjectBtn"
)
.addEventListener(
    "click",
    () => {

        const name =

            document
            .getElementById(
                "projectNameInput"
            )
            .value
            .trim();

        if (!name) {

            return;
        }

        const firstSectionName =

    document
    .getElementById(
        "firstSectionInput"
    )
    .value
    .trim();

const firstSectionTarget =

    parseInt(

        document
        .getElementById(
            "firstTargetInput"
        )
        .value

    );

if(
    !firstSectionName
){

    return;
}

if(
    isNaN(
        firstSectionTarget
    )
){

    return;
}

        const projectId =
            crypto.randomUUID();

        const sectionId =
            crypto.randomUUID();

        projects.push({

            id:
                projectId,

            name:
                name,

            expanded:
                true,

            sections: [

                {
                    id:
                        sectionId,

                    name:
                        firstSectionName,

                    target:
                        firstSectionTarget,

                    current:
                        0,

                    completed:
                        false,

                    instructions:
                        ""
                }

            ]
        });

        currentProjectId =
            projectId;

        currentSectionId =
            sectionId;

        hideModal(
            "projectModal"
        );

        renderProjects();

        loadSelectedSection();
    }
);

/* ======================================================
    ADD SECTION
   ====================================================== */

let activeProjectId =
    null;

function openSectionModal(
    projectId
) {

    activeProjectId =
        projectId;

    document
        .getElementById(
            "sectionNameInput"
        )
        .value = "";

    document
        .getElementById(
            "sectionTargetInput"
        )
        .value = "";

    document
        .getElementById(
            "sectionInstructionInput"
        )
        .value = "";

    showModal(
        "sectionModal"
    );
}

document
.getElementById(
    "createSectionBtn"
)
.addEventListener(
    "click",
    () => {

        const name =

            document
            .getElementById(
                "sectionNameInput"
            )
            .value
            .trim();

        const target =

            parseInt(

                document
                .getElementById(
                    "sectionTargetInput"
                )
                .value

            );

        const instructionText = 
            
            document
            .getElementById(
                "sectionInstructionInput"
            )
            .value
            .trim();

        if (
            !name ||
            !target
        ) {

            return;
        }

        const project =

            projects.find(
                p =>
                    p.id ===
                    activeProjectId
            );

        project.sections.push({

            id:
                crypto.randomUUID(),

            name:
                name,

            target:
                target,

            current:
                0,

            completed:
                false,

            instructions:
                instructionText
        });

        hideModal(
            "sectionModal"
        );

        renderProjects();
    }
);

/* ======================================================
    NEXT SECTION
   ====================================================== */

function openNextSectionModal() {

    const modal =
        document.getElementById(
            "nextSectionModal"
        );

    document
        .getElementById(
            "nextSectionNameInput"
        )
        .value = "";

    document
        .getElementById(
            "nextSectionTargetInput"
        )
        .value = "";

    showModal(
        "nextSectionModal"
    );
}

document
.getElementById(
    "confirmNextSectionBtn"
)
.addEventListener(
    "click",
    () => {

        const name =

            document
            .getElementById(
                "nextSectionNameInput"
            )
            .value
            .trim();

        const target =

            parseInt(

                document
                .getElementById(
                    "nextSectionTargetInput"
                )
                .value

            );

        if (
            !name ||
            !target
        ) {

            return;
        }

        const project =
            getCurrentProject();

        const sectionId =
            crypto.randomUUID();

        project.sections.push({

            id:
                sectionId,

            name:
                name,

            target:
                target,

            current:
                0,

            completed:
                false,

            instructions:
                ""
        });

        currentSectionId =
            sectionId;

        hideModal(
            "nextSectionModal"
        );

        renderProjects();

        loadSelectedSection();
    }
);

/* ======================================================
    PART 4
    INSTRUCTIONS
    CONFETTI
   ====================================================== */

/* ======================================================
    ADD INSTRUCTION
   ====================================================== */

document
.getElementById(
    "editInstructionBtn"
)
.addEventListener(
    "click",
    () => {
        const section = getCurrentSection();

        if (
            !section
        ){
            return;
        }

        document
        .getElementById(
            "instructionInput"
        )
        .value = section.instructions || "";

        showModal(
            "instructionModal"
        );
    }
);

document
.getElementById(
    "saveInstructionBtn"
)
.addEventListener(
    "click",
    () => {
        const section = getCurrentSection();

        if (
            !section
        ){
            return;
        }

        section.instructions = 
            document.getElementById(
                "instructionInput"
            )
            .value;

        saveApp();

        renderInstructions();

        hideModal(
            "instructionModal"
        );
    }
);

document
.getElementById(
    "deleteInstructionBtn"
)
.addEventListener(
    "click",
    () => {
        const section = getCurrentSection();

        if (
            !section
        ){
            return;
        }

        if (
            !confirm( "Delete all instructions?" )
        ){
            return;
        }

        section.instructions = "";

        saveApp();

        renderInstructions();
    }
);

/* ======================================================
    CONFETTI
   ====================================================== */

function launchConfetti() {

    const container =

        document.getElementById(
            "confetti-container"
        );

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const piece =

            document.createElement(
                "div"
            );

        piece.style.position =
            "absolute";

        piece.style.left =
            Math.random() * 100 + "%";

        piece.style.top =
            "-20px";

        piece.style.width =
            "10px";

        piece.style.height =
            "10px";

        piece.style.borderRadius =
            "2px";

        piece.style.background =

            [
                "#D36582",
                "#FFC857",
                "#119DA4",
                "#8E72C7"
            ][
                Math.floor(
                    Math.random() * 4
                )
            ];

        piece.animate(

            [

                {
                    transform:
                        "translateY(0px) rotate(0deg)"
                },

                {
                    transform:
                        `translateY(${window.innerHeight}px) rotate(720deg)`
                }

            ],

            {

                duration:
                    1500 +
                    Math.random() *
                    1000

            }

        );

        container.appendChild(
            piece
        );

        setTimeout(
            () => {

                piece.remove();

            },
            2500
        );
    }
}

/* ======================================================
    CLOSE MODALS
   ====================================================== */

document
.querySelectorAll(
    ".modal"
)
.forEach(
    modal => {

        modal.addEventListener(
            "click",
            e => {

                if (
                    e.target ===
                    modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }
);

/* ======================================================
    FINAL SAVE
   ====================================================== */

saveApp();