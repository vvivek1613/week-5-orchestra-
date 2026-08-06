const toggle = document.getElementById('planner-toggle');
const toggleLabel = document.getElementById('toggle-label');
const goalToggle = document.getElementById('goal-toggle');
const goalLabel = document.getElementById('goal-label');
const goalButtons = document.querySelectorAll('.toggle-option');
const introPopup = document.getElementById('intro-popup');
const closePopupButton = document.getElementById('close-popup');
const form = document.getElementById('meal-form');
const goalInput = document.getElementById('goal-input');
const chatBox = document.getElementById('chat-box');
const explanationText = document.getElementById('explanation-text');

const selectedGoals = new Set(['protein']);
const knownGoals = ['protein', 'carbs', 'calories', 'cheat'];
let plannerOn = false;
let goalMode = 'eat';

function setPlannerState() {
  plannerOn = toggle.checked;
  toggleLabel.textContent = `Planner: ${plannerOn ? 'On' : 'Off'}`;
  goalInput.disabled = !plannerOn;
  document.querySelector('.send-btn').disabled = !plannerOn;
  goalButtons.forEach((btn) => { btn.disabled = !plannerOn; });

  if (!plannerOn) {
    chatBox.innerHTML = '<div class="bubble">Turn the planner on to start asking for meals.</div>';
    explanationText.textContent = 'Your choices will appear here with the reason for the meal suggestion.';
  }
}

function setGoalState() {
  goalMode = goalToggle.checked ? 'hit' : 'eat';
  goalLabel.textContent = `Goal: ${goalMode === 'hit' ? 'Hit' : 'Eat'}`;
}

function updateGoalButtons() {
  goalButtons.forEach((btn) => {
    btn.classList.toggle('active', selectedGoals.has(btn.dataset.goal));
  });
}

function addChatMessage(text, isUser = false) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${isUser ? 'user' : ''}`;
  bubble.textContent = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function buildMeal(preferences) {
  const normalized = preferences.map((item) => item.toLowerCase());
  const has = (keywords) => keywords.some((keyword) => normalized.includes(keyword) || normalized.some((entry) => entry.includes(keyword)));

  let meal;
  if (has(['cheat', 'treat', 'comfort'])) {
    meal = {
      name: 'Loaded Burger Plate',
      prep: '20 min',
      nutrition: 'Protein 36g • Carbs 44g • Calories 760',
      ingredients: ['2 burger patties', '2 buns', 'cheese slices', 'lettuce', 'tomato', 'fries'],
      steps: [
        'Season the burger patties well and cook them in a hot pan until they are nicely browned and cooked through.',
        'Toast the buns lightly and layer them with cheese, lettuce, tomato, and the cooked patties.',
        'Serve with hot fries on the side for a classic comfort-food meal.'
      ]
    };
  } else if (has(['calories', 'bulk', 'big'])) {
    meal = {
      name: 'Chicken Burrito Bowl',
      prep: '25 min',
      nutrition: 'Protein 40g • Carbs 48g • Calories 710',
      ingredients: ['1 chicken breast', '1 cup rice', '1/2 avocado', 'beans', 'lettuce', 'salsa'],
      steps: [
        'Cook the chicken breast in a skillet until it is golden and fully cooked, then slice it into strips.',
        'Warm the rice and beans, then layer them in a bowl with lettuce, avocado, and salsa.',
        'Top everything with the chicken and serve while warm for a filling bowl.'
      ]
    };
  } else if (has(['carbs', 'pasta', 'rice', 'bread'])) {
    meal = {
      name: 'Creamy Pasta Bowl',
      prep: '18 min',
      nutrition: 'Protein 26g • Carbs 58g • Calories 620',
      ingredients: ['8 oz pasta', 'chicken or tofu', 'olive oil', 'parmesan', 'spinach'],
      steps: [
        'Boil the pasta until it is tender, then drain it and reserve a little cooking water.',
        'Cook the chicken or tofu in olive oil and toss it with the pasta and a sprinkle of parmesan.',
        'Fold in spinach at the end so it wilts gently and creates a creamy, cozy finish.'
      ]
    };
  } else {
    meal = {
      name: 'Grilled Chicken Quinoa Bowl',
      prep: '22 min',
      nutrition: 'Protein 38g • Carbs 32g • Calories 530',
      ingredients: ['2 chicken breasts', '1 cup quinoa', 'broccoli', 'olive oil', 'lemon'],
      steps: [
        'Season the chicken well and grill it until the outside is lightly charred and the inside is juicy.',
        'Cook the quinoa and roast the broccoli until the edges are crisp and caramelized.',
        'Plate everything together and finish with a squeeze of lemon for a bright, balanced meal.'
      ]
    };
  }

  return meal;
}

function renderMeal(meal, preferences) {
  chatBox.querySelectorAll('.meal-card').forEach((card) => card.remove());

  const card = document.createElement('div');
  card.className = 'meal-card';
  card.innerHTML = `
    <h4>${meal.name}</h4>
    <p><strong>Prep time:</strong> ${meal.prep}</p>
    <p><strong>Nutrition:</strong> ${meal.nutrition}</p>
    <p><strong>Ingredients:</strong></p>
    <ul>${meal.ingredients.map((item) => `<li>${item}</li>`).join('')}</ul>
    <p><strong>How to make it:</strong></p>
    <ul>${meal.steps.map((step) => `<li>${step}</li>`).join('')}</ul>
  `;
  chatBox.appendChild(card);
  chatBox.scrollTop = chatBox.scrollHeight;

  explanationText.innerHTML = `Goal: <strong>${goalMode === 'hit' ? 'Hit' : 'Eat'}</strong><br>Chosen tags: <strong>${preferences.join(', ') || 'none'}</strong>`;
}

function generateMeal() {
  if (!plannerOn) {
    addChatMessage('Turn the planner on first.');
    return;
  }

  const typedTags = goalInput.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const typedGoals = typedTags
    .filter((item) => knownGoals.includes(item.toLowerCase()))
    .map((item) => item.toLowerCase());

  if (typedGoals.length > 0) {
    selectedGoals.clear();
    typedGoals.forEach((goal) => selectedGoals.add(goal));
    updateGoalButtons();
  }

  const preferences = [
    ...selectedGoals,
    ...typedTags.filter((item) => !knownGoals.includes(item.toLowerCase()))
  ];

  addChatMessage(goalInput.value || 'I want a meal with my current choices.', true);

  const meal = buildMeal(preferences);
  renderMeal(meal, preferences);
  goalInput.value = '';
}

closePopupButton.addEventListener('click', () => {
  introPopup.style.display = 'none';
});

goalButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const goal = button.dataset.goal;
    if (selectedGoals.has(goal)) {
      selectedGoals.delete(goal);
    } else {
      selectedGoals.add(goal);
    }
    updateGoalButtons();

    if (plannerOn) {
      generateMeal();
    }
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  generateMeal();
});

goalInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    generateMeal();
  }
});

goalToggle.addEventListener('change', () => {
  setGoalState();
  if (plannerOn) {
    generateMeal();
  }
});

toggle.addEventListener('change', () => {
  setPlannerState();
  setGoalState();
});

setPlannerState();
setGoalState();
updateGoalButtons();
addChatMessage('Hello! I can build a meal plan with prep time, nutrition, ingredients, and steps.');
