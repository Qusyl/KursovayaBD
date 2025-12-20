using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("warehouse", Schema = "public")]
    public class WarehouseModel
    {
        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("shop")]
    
        public int Shop {  get; set; }

        [Required]
        [Column("product")]
        
        public int Product { get; set; }

        [Column("product_name")]
        [MaxLength(50)]

        public string ProductName { get; set; } = string.Empty;

        [Column("in_stock")]
        public int InStock { get; set; } = 0;

    

    }
}
