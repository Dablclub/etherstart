# Starting our project

We will create a new NextJS project using their own CLI tool, create-next-app

```
npx create-next-app@latest
```

Answer the prompts

```
What is your project named?  next-app // you can choose any name
Would you like to use TypeScript?   Yes
Would you like to use ESLint?  Yes
Would you like to use Tailwind CSS?  Yes
Would you like to use `src/` directory?  Yes
Would you like to use App Router? (recommended)  Yes
Would you like to customize the default import alias (@/*)?  No
```

Once the CLI tool creates the project and installs the dependencies, you can start the development server by running the following script

```
npm run dev
```

On your explorer, navigate to the url: https://localhost:3000

![NextJS application default homepage](https://react-to-web3-bootcamp.vercel.app/content/module-2/L1/1-next-app.png)

For the bootcamp, we’re going to start with a base repository, which will include some ui components that will be helpful during your development journey. To this end, we will set up shadcn/ui, an excellent collection of reusable components that works very well with NextJS and even React Server Components. You can check the [documentation here](https://ui.shadcn.com/docs).

Run this command in the cli to set up shadcn/ui in the NextJS project.

```
npx shadcn@latest init -d
```

This will set up shadcn with the default options.

Now we will add some shadcn/ui components:

```
npx shadcn@latest add button sheet sonner
```

If you explore the [repository](https://github.com/Dablclub/etherstart), we have created some basic components for the layout, and we can see some of the files installed by shadcn/ui, in the `/components/ui` folder, the `/lib/utils.ts` and the `/styles/globals.css` files. Feel free to copy/paste these files into your project.

Files to update

- `/public` folder, copy and paste
- `/src/app` folder replace `layout.tsx`, `not-found.tsx` and `page.tsx`
- `/src/app` folder, copy and paste `icon.ico`
- `/src/components/layout` folder, copy and paste
- `/src/styles` folder, copy and paste

![NextJS project structure](https://react-to-web3-bootcamp.vercel.app/content/module-2/L1/2-project-structure.png)

### Next steps

We have created a basic NextJS application from scratch, which will allow us to set up all the dependencies and configurations that we will need to interact with Polygon, as well as any other chains that you would like to explore.

Setting up a project without templates or scaffolded projects will help you understand better how the individual components work, why are they needed and how to configure them for our needs, in such a way that once you will be able to change them as you wish.
