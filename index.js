const { chromium } = require('playwright');
const fs = require('fs');

const miPrimerWebScraping = async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();

    await pagina.goto("https://listado.mercadolibre.com.co/arduino-uno");
    await pagina.screenshot({path: "resultados/mipagina.png"})

    navegador.close()
}

const miSegundoWebScraping = async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();

    await pagina.goto("https://listado.mercadolibre.com.co/arduino-uno");

    const {items} = listarResultados(pagina);

    fs.writeFile('resultados/resultados_mercadopago.json', JSON.stringify(items, null, 2), (err) => {
        if (err) {
          console.error('Error al escribir el archivo:', err);
        } else {
          console.log('Archivo JSON creado con éxito.');
        }
      
    });

    navegador.close()
}

const miTercerWebScraping = async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();

    await pagina.goto("https://listado.mercadolibre.com.co/arduino-uno");

    const {mayorValor, menorValor} = await listarResultados(pagina);

    console.log(mayorValor, menorValor)

    navegador.close()
}

const miCuartoWebScraping = async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();

    await pagina.goto("https://listado.mercadolibre.com.co/arduino-uno");

    let haySiguientePagina = true;

    while(haySiguientePagina) {
        const {mayorValor, menorValor} = await listarResultados(pagina);

        console.log(mayorValor, menorValor)

        const nextButton = await pagina.$('.ui-search-link[title="Siguiente"]');

        if (nextButton) {
            await nextButton.click();
            await pagina.waitForTimeout(2000);
        } else {
            haySiguientePagina = false;
        }
    }
    navegador.close()
}

const miQuintoWebScraping = async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();

    await pagina.goto("https://listado.mercadolibre.com.co/arduino-uno");

    let haySiguientePagina = true;
    let mayorDeTodosValor = {titulo: "No Encontrado", precio: 0}
    let menorDeTodosValor = {titulo: "No Encontrado", precio: Infinity}

    while(haySiguientePagina) {
        const {mayorValor, menorValor} = await listarResultados(pagina);

        const nextButton = await pagina.$('.ui-search-link[title="Siguiente"]');
        mayorDeTodosValor = (mayorDeTodosValor.precio < mayorValor.precio) ? mayorValor : mayorDeTodosValor;
        menorDeTodosValor = (menorDeTodosValor.precio > menorValor.precio) ? menorValor : menorDeTodosValor;

        if (nextButton) {
            await nextButton.click();
            await pagina.waitForTimeout(1000);
        } else {
            haySiguientePagina = false;
        }
    }

    console.log(mayorDeTodosValor, menorDeTodosValor)

    navegador.close()
}

const miSextoWebScraping = async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();
  
    await pagina.goto("https://www.worldometers.info/es/");
  
    // Mantén la función en ejecución para que se actualice en tiempo real
    while (true) {
      let result = await pagina.$('.rts-counter[rel="current_population"]');
      result = await result.$$("span");
  
      let text = "";
  
      for (const span of result) {
        text += await span.innerText();
      }
  
      console.log("Población mundial:", text);
  
      // Esperar un intervalo de tiempo antes de la próxima actualización (ejemplo: 5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

const listarResultados = async (pagina) => {
    
    const {items, mayorValor, menorValor} = await pagina.evaluate(() => {
        const itemElements = document.querySelectorAll('.ui-search-layout__item');
        const items = [];

        let mayorValor = {titulo: "No Encontrado", precio: 0}
        let menorValor = {titulo: "No Encontrado", precio: Infinity}

        itemElements.forEach((element) => {
            const titulo = element.querySelector('.ui-search-item__title')?.textContent || '';
            const precioText = element.querySelector('.ui-search-price__second-line').querySelector('.andes-money-amount__fraction')?.textContent || '';
            const precio = parseFloat(precioText.replace(/[,.]/g, ''));
            const url = element.querySelector('.ui-search-link')?.href || '';

            if (titulo && precioText) {
                items.push({ titulo, precio, url, precioText });

                mayorValor = (mayorValor.precio < precio) ? {titulo, precio, url, precioText} : mayorValor;
                menorValor = (menorValor.precio > precio) ? {titulo, precio, url, precioText} : menorValor;
            }
        });

        return {items, mayorValor, menorValor};

    });

    return {items, mayorValor, menorValor};
};




Promise.allSettled([
    miSextoWebScraping(),
  ]).then((results) => {
    console.log("Todas las tareas han terminado");
  });