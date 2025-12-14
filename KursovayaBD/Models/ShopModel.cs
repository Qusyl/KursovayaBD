
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{

    [Table("shop", Schema = "public")]
    public class ShopModel
    {
        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; } 
        [Column("shop_name")]
        [MaxLength(50)]
        public string ShopName { get; set; } = string.Empty;

        [Column("shop_type")]
        [MaxLength(50)]
        public string ShopType { get; set; } = string.Empty;

        [Column("geoposition")]
        [MaxLength(50)]
        public string Geoposition { get; set; } = string.Empty;

        [Column("fund")]
        public decimal Fund { get; set; } = decimal.Zero;
    }
}
