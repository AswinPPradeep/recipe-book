
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/recipes";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "Breakfast",
    ingredients: "",
    steps: "",
    cookingTime: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadRecipes() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to load recipes");
      setRecipes(await response.json());
    } catch {
      setMessage("Cannot connect to backend. Check that the server is running.");
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm({
      name: "",
      category: "Breakfast",
      ingredients: "",
      steps: "",
      cookingTime: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = { ...form, cookingTime: Number(form.cookingTime) };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save recipe");

      setMessage(editingId ? "Recipe updated successfully!" : "Recipe added successfully!");
      resetForm();
      await loadRecipes();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editRecipe(recipe) {
    setForm({
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: String(recipe.cookingTime),
    });
    setEditingId(recipe._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRecipe(id) {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Unable to delete recipe");

      setMessage("Recipe deleted successfully!");
      await loadRecipes();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">YOUR PERSONAL COOKBOOK</p>
          <h1>Recipe Book <span>🍲</span></h1>
          <p>Save your favourites. Discover your next delicious meal.</p>
        </div>
      </header>

      <section className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GET COOKING</p>
            <h2>{editingId ? "Edit Recipe" : "Add a Recipe"}</h2>
          </div>
        </div>

        <form className="recipe-form" onSubmit={handleSubmit}>
          <label>
            Recipe Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Vegetable Fried Rice"
              required
            />
          </label>

          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              {["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Ingredients
            <textarea
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
              placeholder="List your ingredients..."
              required
              rows="3"
            />
          </label>

          <label>
            Cooking Steps
            <textarea
              name="steps"
              value={form.steps}
              onChange={handleChange}
              placeholder="Explain how to prepare it..."
              required
              rows="4"
            />
          </label>

          <label>
            Cooking Time (minutes)
            <input
              name="cookingTime"
              type="number"
              min="1"
              value={form.cookingTime}
              onChange={handleChange}
              placeholder="e.g. 30"
              required
            />
          </label>

          <div className="form-actions">
            <button className="primary-btn" type="submit">
              {editingId ? "Update Recipe" : "Add Recipe"}
            </button>
            {editingId && (
              <button className="secondary-btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="message" role="status">{message}</p>}

        <div className="section-heading recipes-heading">
          <div>
            <p className="eyebrow">MADE BY YOU</p>
            <h2>Your Recipes</h2>
          </div>
          <span className="recipe-count">{recipes.length} recipes</span>
        </div>

        {recipes.length === 0 ? (
          <div className="empty-state">
            <span>🥗</span>
            <h3>No recipes yet</h3>
            <p>Add your first recipe using the form above.</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <article className="recipe-card" key={recipe._id}>
                <div className="card-top">
                  <span className="category">{recipe.category}</span>
                  <span className="time">⏱ {recipe.cookingTime} min</span>
                </div>
                <h3>{recipe.name}</h3>

                <h4>Ingredients</h4>
                <p className="recipe-text">{recipe.ingredients}</p>

                <h4>Cooking Steps</h4>
                <p className="recipe-text">{recipe.steps}</p>

                <div className="card-actions">
                  <button className="secondary-btn" onClick={() => editRecipe(recipe)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteRecipe(recipe._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>Made with ❤️ for food lovers</footer>
    </main>
  );
}

export default App;
