using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("sales", Schema = "public")]
    public class SalesModel
    {
        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("product")]
      
        public int Product { get; set; }

        [Required]
        [Column("shop")]

        public int Shop { get; set; }

        [Column("profit")]
        public decimal Profit {  get; set; } = decimal.Zero;


    



    }
}
