using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("product", Schema = "public")]
    public class ProductModel
    {
        [Key]
        [Required]
        [Column("id")]

        public int Id { get; set; }

        [Column("product_name")]
        [MaxLength(50)]
        public string ProductName { get; set; }  = string.Empty;

        [Column("product_price")]
        public decimal ProductPrice { get; set; } = decimal.Zero;

        [Column("producer")]
        [MaxLength(100)]
        public string Producer { get; set; } = string.Empty;

        [Column("category")]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

    }
}
