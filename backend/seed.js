const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Recipe = require('./models/Recipe');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@recipenest.com',
      password: 'admin123',
      role: 'admin',
      bio: 'Platform Administrator'
    });

    // Create Chefs
    const chef1 = await User.create({
      name: 'Gordon Ramsey Jr',
      email: 'gordon@recipenest.com',
      password: 'chef123',
      role: 'chef',
      bio: 'Michelin-starred chef specializing in French cuisine with a modern twist.',
      specialty: 'French Cuisine',
      socialLinks: {
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com',
        youtube: 'https://youtube.com'
      }
    });

    const chef2 = await User.create({
      name: 'Maria Rossi',
      email: 'maria@recipenest.com',
      password: 'chef123',
      role: 'chef',
      bio: 'Italian grandmother who brought nonna\'s recipes to the modern world.',
      specialty: 'Italian Cuisine',
      socialLinks: {
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com'
      }
    });

    const chef3 = await User.create({
      name: 'Kenji Tanaka',
      email: 'kenji@recipenest.com',
      password: 'chef123',
      role: 'chef',
      bio: 'Tokyo-born chef bringing authentic Japanese street food to your home kitchen.',
      specialty: 'Japanese Cuisine'
    });

    // Create Food Lovers
    await User.create({
      name: 'Food Lover Alice',
      email: 'foodlover@recipenest.com',
      password: 'food123',
      role: 'foodlover',
      bio: 'Passionate about trying new recipes from around the world!'
    });

    await User.create({
      name: 'Bob Foodie',
      email: 'bob@recipenest.com',
      password: 'food123',
      role: 'foodlover'
    });

    // Create Recipes
    await Recipe.create([
      {
        title: 'Classic Beef Bourguignon',
        description: 'A hearty French stew with tender beef braised in red wine.',
        ingredients: ['2 lbs beef chuck', '1 bottle red wine', '4 carrots', '2 onions', 'fresh thyme', 'bay leaves', 'mushrooms', 'bacon lardons'],
        instructions: [
          { step: 1, text: 'Cut beef into 2-inch cubes and season with salt and pepper.' },
          { step: 2, text: 'Brown the beef in batches in a Dutch oven with butter.' },
          { step: 3, text: 'Sauté onions and carrots until softened.' },
          { step: 4, text: 'Add wine and beef stock, bring to simmer.' },
          { step: 5, text: 'Cook in oven at 325°F for 2.5 hours.' }
        ],
        category: 'Dinner',
        cuisine: 'French',
        prepTime: 30,
        cookTime: 150,
        servings: 6,
        difficulty: 'Hard',
        tags: ['beef', 'french', 'stew', 'wine'],
        chef: chef1._id
      },
      {
        title: 'Perfect Omelette',
        description: 'The classic French omelette — silky, creamy, and perfectly folded.',
        ingredients: ['3 eggs', '1 tbsp butter', 'salt', 'pepper', 'fresh chives', 'gruyere cheese'],
        instructions: [
          { step: 1, text: 'Whisk eggs with salt and pepper until light.' },
          { step: 2, text: 'Melt butter in non-stick pan over medium heat.' },
          { step: 3, text: 'Pour in eggs, stir gently with spatula.' },
          { step: 4, text: 'Let set, add cheese, fold and serve.' }
        ],
        category: 'Breakfast',
        cuisine: 'French',
        prepTime: 5,
        cookTime: 5,
        servings: 1,
        difficulty: 'Medium',
        tags: ['eggs', 'breakfast', 'quick', 'french'],
        chef: chef1._id
      },
      {
        title: 'Authentic Spaghetti Carbonara',
        description: 'No cream! The real Roman carbonara with guanciale and pecorino.',
        ingredients: ['400g spaghetti', '200g guanciale', '4 egg yolks', '100g pecorino romano', 'black pepper'],
        instructions: [
          { step: 1, text: 'Cook pasta in salted boiling water.' },
          { step: 2, text: 'Fry guanciale until crispy, remove from heat.' },
          { step: 3, text: 'Mix egg yolks with pecorino and generous black pepper.' },
          { step: 4, text: 'Combine hot pasta with guanciale, add egg mixture off heat.' },
          { step: 5, text: 'Toss quickly, adding pasta water to achieve creamy sauce.' }
        ],
        category: 'Dinner',
        cuisine: 'Italian',
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'Medium',
        tags: ['pasta', 'italian', 'egg', 'classic'],
        chef: chef2._id
      },
      {
        title: 'Tiramisu',
        description: 'The classic Italian dessert — layers of espresso-soaked ladyfingers and mascarpone.',
        ingredients: ['500g mascarpone', '4 eggs', '100g sugar', 'ladyfingers', 'strong espresso', 'cocoa powder', 'marsala wine'],
        instructions: [
          { step: 1, text: 'Separate eggs and beat yolks with sugar until pale.' },
          { step: 2, text: 'Fold mascarpone into yolk mixture.' },
          { step: 3, text: 'Beat egg whites to stiff peaks and fold in.' },
          { step: 4, text: 'Dip ladyfingers in espresso and layer with cream.' },
          { step: 5, text: 'Refrigerate overnight and dust with cocoa before serving.' }
        ],
        category: 'Dessert',
        cuisine: 'Italian',
        prepTime: 30,
        cookTime: 0,
        servings: 8,
        difficulty: 'Medium',
        tags: ['dessert', 'italian', 'coffee', 'no-bake'],
        chef: chef2._id
      },
      {
        title: 'Tonkotsu Ramen',
        description: 'Rich creamy pork bone broth ramen with chashu pork and soft-boiled egg.',
        ingredients: ['pork bones', 'ramen noodles', 'pork belly', 'eggs', 'nori', 'green onions', 'soy sauce', 'mirin', 'sesame oil'],
        instructions: [
          { step: 1, text: 'Simmer pork bones for 12 hours to create white, creamy broth.' },
          { step: 2, text: 'Prepare chashu by rolling pork belly and braising in soy/mirin.' },
          { step: 3, text: 'Soft boil eggs and marinate in soy-mirin mixture.' },
          { step: 4, text: 'Cook noodles and assemble bowls with broth, toppings.' }
        ],
        category: 'Dinner',
        cuisine: 'Japanese',
        prepTime: 60,
        cookTime: 720,
        servings: 4,
        difficulty: 'Hard',
        tags: ['ramen', 'japanese', 'pork', 'noodles'],
        chef: chef3._id
      },
      {
        title: 'Onigiri (Rice Balls)',
        description: 'Japanese comfort food — hand-shaped rice balls with various fillings.',
        ingredients: ['2 cups japanese short-grain rice', 'nori sheets', 'tuna mayo', 'pickled plum (umeboshi)', 'soy sauce', 'salt'],
        instructions: [
          { step: 1, text: 'Cook and season rice with salt.' },
          { step: 2, text: 'Wet hands with salted water, take a handful of rice.' },
          { step: 3, text: 'Make an indent, add filling, close and shape into triangle.' },
          { step: 4, text: 'Wrap with nori strip and serve.' }
        ],
        category: 'Snack',
        cuisine: 'Japanese',
        prepTime: 15,
        cookTime: 30,
        servings: 6,
        difficulty: 'Easy',
        tags: ['rice', 'japanese', 'portable', 'snack'],
        chef: chef3._id
      }
    ]);

    console.log('✅ Seed data created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('─────────────────────────────────');
    console.log('ADMIN:      admin@recipenest.com   / admin123');
    console.log('CHEF 1:     gordon@recipenest.com  / chef123');
    console.log('CHEF 2:     maria@recipenest.com   / chef123');
    console.log('CHEF 3:     kenji@recipenest.com   / chef123');
    console.log('FOOD LOVER: foodlover@recipenest.com / food123');
    console.log('─────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
