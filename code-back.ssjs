<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Productos</title>
</head>
<body>
  <script runat="server">
    Platform.Load("Core", "1.1.1");

    /* =========================================================
      Función que divide texto para evitar descriptores largos
    ========================================================= */
    function splitText(text) {
      var max = 24;
      var part1 = "";
      var part2 = "";

      // Caso 1: Texto nulo
      if (!text) {
        return "<br>";
      }

      // Caso 2: Texto corto
      if (text.length <= max) {
        part1 = text;
        return part1 + "<br>";
      } 

      // Caso 3: Texto largo
      var temp = text.substring(0, max);
      var lastSpace = temp.lastIndexOf(" ");

      if (lastSpace > 0) {
        part1 = temp.substring(0, lastSpace);
      } else {
        part1 = temp;
      }

      var rest = text.substring(part1.length); //text.substring(part1.length).trim();

      if (rest.length <= max) {
        part2 = rest;
      } else {
        part2 = rest.substring(0, max) + "...";
      }
      return part1 + "<br>" + part2;
    } 


/*  function splitText(text) {
  var x = text.length;
  var y = text.substring(0, 24);
  var z = text.lastIndexOf(" ");
  var w = text.trim(); // no existe funcion en ssjs
  return x + y + z;
 } */
    /* =========================================================
      Main que consulta atributos del producto a mostrar en HTML
    ========================================================= */
    try {
      var productList = [
        "273358",
        "545055",
        "546661",
        "383877",
        "259654",
        "574372"
      ];

      var dataExtension = "ProductDetail";
      var productDetails = [];

      for (var i = 0; i < productList.length; i++) {
        var codigo = productList[i];
        var rows = Platform.Function.LookupRows(dataExtension, ["codigo_producto"], [codigo]);
        var row = (rows && rows.length > 0) ? rows[0] : null;

        if (row) {
          // Casos bordes de los campos de interes
          var descripcion = splitText(row["descripcion"]);
          var precio_normal = row["precio_normal_cl"] || 9999999;
          var precio_oferta = row["precio_oferta_cl"] || row["precio_normal_cl"];
          var descuento = Math.round(((row["precio_normal_cl"] - row["precio_oferta_cl"]) / row["precio_normal_cl"]) * 100);
          var imagen = row["url_imagen"] || "https://image.mailcruzverde.cl/lib/fe3615717564047b711178/m/1/70239c1d-2dac-4c6a-af85-fb4336152eac.png";
          var pdp = row["url_pdp"] || "https://www.cruzverde.cl/";
          
          //Formatear para mostrar en HTML
          precio_normal = "$" + String(precio_normal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          precio_oferta = "$" + String(precio_oferta).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          descuento = "-" + descuento + "%";

          productDetails.push({
            index: i + 1,
            status: "encontrado",
            codigo: row["codigo_producto"],
            descripcion: descripcion,
            marca: row["marca"],
            precio_normal: precio_normal,
            precio_oferta: precio_oferta,
            descuento: descuento,
            imagen: imagen,
            pdp: pdp
          });

        } else {

          productDetails.push({
            index: i + 1,
            status: "no encontrado",
            codigo: codigo,
            descripcion: "",
            marca: "",
            precio_normal: "$9.999.999",
            precio_oferta: "$9.999.999",
            descuento: "0%",
            imagen: "",
            pdp: ""
          });

        }
      }

      // Stringify
      var productDetailsString = Platform.Function.Stringify(productDetails);

      // Print en pantalla
      // Write('<pre>' + productDetailsString + '</pre>');

      // Print consola navegador
      Write('<script>console.log(' + productDetailsString + ')</script>');

      // Pasar a AMPscript
      Variable.SetValue("@productDetailsString", productDetailsString);

    } catch (ex) {
      Write("Ocurrió un error: " + String(ex));
    }
  </script>

  %%[
    SET @productDetailsRows = BuildRowsetFromJSON(@productDetailsString, "$[*]", 1)
  ]%%

  <p>
    %%=v(Field(Row(@productDetailsRows, 2), "codigo"))=%%
    %%=v(Field(Row(@productDetailsRows, 2), "precio_normal"))=%%
    %%=v(Field(Row(@productDetailsRows, 2), "descuento"))=%%
  </p>
</body>
</html>