const api = "/api/users";
const form = document.getElementById("userForm");
const title = document.getElementById("title");

// При загрузке страницы: если есть ?id=, то это редактирование
async function loadUser() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;
  title.textContent = "Редагувати користувача";

  try {
    const res = await fetch(`${api}/${id}`);
    if (!res.ok) {
      alert("Користувача не знайдено!");
      location.href = "/admin.html";
      return;
    }
    const u = await res.json();

    // Заполняем форму
    form.id.value           = u.id || "";
    form.name.value         = u.name || "";
    form.status.value       = u.status || "";
    form.dob.value          = u.dob || "";
    form.issueDate.value    = u.issueDate || "";
    form.expiryDate.value   = u.expiryDate || "";
    form.issuedBy.value     = u.issuedBy || "";
    form.seriesNum.value    = u.seriesNum || "";
    form["categories[0].cat"].value  = u.categories?.[0]?.cat || "";
    form["categories[0].date"].value = u.categories?.[0]?.date || "";
    form["categories[1].cat"].value  = u.categories?.[1]?.cat || "";
    form["categories[1].date"].value = u.categories?.[1]?.date || "";
    form.restrictions.value = u.restrictions || "";
  } catch (e) {
    alert("Помилка при завантаженні користувача!");
    location.href = "/admin.html";
  }
}

// При отправке формы — POST или PUT
form.onsubmit = async e => {
  e.preventDefault();
  // собираем объект из полей
  const data = {
    name: form.name.value,
    status: form.status.value,
    dob: form.dob.value,
    issueDate: form.issueDate.value,
    expiryDate: form.expiryDate.value,
    issuedBy: form.issuedBy.value,
    seriesNum: form.seriesNum.value,
    categories: [
      {
        cat: form["categories[0].cat"].value,
        date: form["categories[0].date"].value
      },
      {
        cat: form["categories[1].cat"].value,
        date: form["categories[1].date"].value
      }
    ],
    restrictions: form.restrictions.value
  };
  const id = form.id.value;
  const method = id ? "PUT" : "POST";
  const url    = id ? `${api}/${id}` : api;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  // возвращаемся в список
  location.href = "/admin.html";
};

// Список пользователей — на admin.html
async function refreshList() {
  const tbody = document.querySelector("#usersTable tbody");
  const users = await fetch(api).then(r => r.json());

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>
        <button onclick="location.href='edit.html?id=${u.id}'">
          Редагувати
        </button>
        <button onclick="
          if (confirm('Видалити цього користувача?')) {
            fetch('${api}/${u.id}', { method: 'DELETE' })
              .then(refreshList);
          }
        ">
          Видалити
        </button>
        <button onclick="location.href='result.html?id=${u.id}'">
          Переглянути
        </button>
      </td>
    </tr>
  `).join("");
}

// Привязываем нужный обработчик загрузки
window.onload = () => {
  if (location.pathname.endsWith("admin.html")) {
    refreshList();
  } else {
    loadUser();
  }
};
