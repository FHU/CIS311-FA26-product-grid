// [6] Aisle filter: one radio per data-category found on the cards,
//     then show only the cards whose category matches the checked radio
const ALL = 'All items';

const filters = document.querySelector('.filters');
const fieldset = filters.querySelector('fieldset');
const cards = document.querySelectorAll('.card');

// A Set drops duplicates and keeps first-seen order, so aisles list in page order
const categories = new Set([...cards].map(card => card.dataset.category));

function addOption(category, index) {
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'aisle';
  input.id = `f-${index}`;
  input.value = category;
  input.checked = category === ALL;

  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.textContent = category;

  fieldset.append(input, label);
}

function applyFilter() {
  const aisle = filters.elements.aisle.value;
  for (const card of cards) {
    card.hidden = aisle !== ALL && card.dataset.category !== aisle;
  }
}

[ALL, ...categories].forEach(addOption);
filters.addEventListener('change', applyFilter);
